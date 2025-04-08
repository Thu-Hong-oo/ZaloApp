package com.zalo.auth.service;

import java.text.DecimalFormat;
import java.time.Duration;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import com.zalo.auth.config.TwilioConfig;
import com.zalo.auth.dto.OTPStatus;
import com.zalo.auth.dto.PasswordResetRequestDto;
import com.zalo.auth.dto.PasswordResetResponseDto;
import com.zalo.auth.exception.InvalidOtpException;
import com.zalo.auth.model.OtpData;

import reactor.core.publisher.Mono;

@Service
public class TwilioOTPService {

    @Autowired
    private TwilioConfig twilioConfig;

    @Autowired
    private ReactiveRedisTemplate<String, String> redisTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    private static final Duration OTP_EXPIRY = Duration.ofMinutes(5);
    private static final Duration RATE_LIMIT_DURATION = Duration.ofMinutes(1);
    private static final int MAX_OTP_ATTEMPTS = 3;

    /**
     * Gửi OTP để đặt lại mật khẩu
     */
    public Mono<PasswordResetResponseDto> sendOTPPasswordReset(PasswordResetRequestDto passwordResetRequestDto) {
        String phoneNumber = formatPhoneNumber(passwordResetRequestDto.getPhoneNumber());
        String rateLimitKey = "rate_limit:" + phoneNumber;
        String otpKey = "otp:" + phoneNumber;

        return redisTemplate.opsForValue().get(rateLimitKey)
                .flatMap(existingRateLimit -> {
                    if (existingRateLimit != null) {
                        return Mono.just(new PasswordResetResponseDto(OTPStatus.FAILED, 
                            "Vui lòng đợi 1 phút trước khi yêu cầu mã OTP mới"));
                    }
                    return generateAndSendOTP(phoneNumber, otpKey, rateLimitKey);
                })
                .switchIfEmpty(generateAndSendOTP(phoneNumber, otpKey, rateLimitKey));
    }

    private Mono<PasswordResetResponseDto> generateAndSendOTP(String phoneNumber, String otpKey, String rateLimitKey) {
        String otp = generateOTP();
        OtpData otpData = new OtpData(phoneNumber, otp, 
            java.time.LocalDateTime.now(), 
            java.time.LocalDateTime.now().plus(OTP_EXPIRY));

        try {
            String otpDataJson = objectMapper.writeValueAsString(otpData);
            System.out.println("Generated OTP data: " + otpDataJson);
            System.out.println("Saving to Redis with key: " + otpKey);

            return redisTemplate.opsForValue()
                    .set(otpKey, otpDataJson, OTP_EXPIRY)
                    .doOnSuccess(success -> {
                        System.out.println("Successfully saved OTP to Redis");
                        try {
                            // Gửi OTP qua Twilio
                            System.out.println("Sending OTP via Twilio to: " + phoneNumber);
                            Message.creator(
                                    new PhoneNumber(phoneNumber),
                                    new PhoneNumber(twilioConfig.getPhoneNumber()),
                                    "Mã OTP của bạn là: " + otp + ". Mã này sẽ hết hạn sau 5 phút.")
                                    .create();
                            System.out.println("Successfully sent OTP via Twilio");
                        } catch (Exception e) {
                            System.out.println("Error sending OTP via Twilio: " + e.getMessage());
                            e.printStackTrace();
                        }
                    })
                    .then(redisTemplate.opsForValue().set(rateLimitKey, "1", RATE_LIMIT_DURATION))
                    .thenReturn(new PasswordResetResponseDto(OTPStatus.DELIVERED, "Đã gửi mã OTP thành công"))
                    .onErrorResume(e -> {
                        System.out.println("Error in generateAndSendOTP: " + e.getMessage());
                        e.printStackTrace();
                        return Mono.just(new PasswordResetResponseDto(OTPStatus.FAILED, 
                            "Không thể gửi mã OTP: " + e.getMessage()));
                    });
        } catch (Exception e) {
            System.out.println("Error serializing OTP data: " + e.getMessage());
            e.printStackTrace();
            return Mono.just(new PasswordResetResponseDto(OTPStatus.FAILED, 
                "Không thể gửi mã OTP: " + e.getMessage()));
        }
    }

    /**
     * Xác thực OTP
     */
    public Mono<String> validateOTP(String userInputOtp, String phoneNumber) {
        String formattedPhoneNumber = formatPhoneNumber(phoneNumber);
        String otpKey = "otp:" + formattedPhoneNumber;
        
        System.out.println("Validating OTP for formatted phone: " + formattedPhoneNumber);
        System.out.println("Using Redis key: " + otpKey);
        
        return redisTemplate.opsForValue().get(otpKey)
                .doOnNext(storedOtpJson -> System.out.println("Found stored OTP data: " + storedOtpJson))
                .flatMap(storedOtpJson -> {
                    try {
                        OtpData otpData = objectMapper.readValue(storedOtpJson, OtpData.class);
                        System.out.println("Parsed OTP data: " + otpData);
                        
                        if (otpData.isExpired()) {
                            System.out.println("OTP has expired");
                            return redisTemplate.opsForValue().delete(otpKey)
                                    .then(Mono.error(new InvalidOtpException("Mã OTP đã hết hạn")));
                        }

                        if (otpData.hasExceededMaxAttempts()) {
                            System.out.println("Max attempts exceeded");
                            return redisTemplate.opsForValue().delete(otpKey)
                                    .then(Mono.error(new InvalidOtpException("Đã vượt quá số lần thử tối đa")));
                        }

                        if (!otpData.getOtp().equals(userInputOtp)) {
                            System.out.println("Invalid OTP. Expected: " + otpData.getOtp() + ", Got: " + userInputOtp);
                            otpData.incrementAttempts();
                            String updatedOtpDataJson = objectMapper.writeValueAsString(otpData);
                            return redisTemplate.opsForValue().set(otpKey, updatedOtpDataJson, OTP_EXPIRY)
                                    .then(Mono.error(new InvalidOtpException("Mã OTP không chính xác")));
                        }

                        System.out.println("OTP is valid");
                        return redisTemplate.opsForValue().delete(otpKey)
                                .then(Mono.just("Mã OTP hợp lệ, vui lòng tiếp tục"));
                    } catch (Exception e) {
                        System.out.println("Error processing OTP: " + e.getMessage());
                        e.printStackTrace();
                        return Mono.error(new InvalidOtpException("Lỗi khi xử lý mã OTP: " + e.getMessage()));
                    }
                })
                .switchIfEmpty(Mono.error(new InvalidOtpException("Mã OTP không tồn tại")))
                .doOnError(error -> System.out.println("Validation error: " + error.getMessage()));
    }

    /**
     * Tạo OTP ngẫu nhiên gồm 6 chữ số
     */
    private String generateOTP() {
        return new DecimalFormat("000000").format(new Random().nextInt(999999));
    }

    /**
     * Định dạng số điện thoại cho Twilio
     */
    private String formatPhoneNumber(String phoneNumber) {
        // Loại bỏ tất cả các ký tự không phải số
        String cleanedNumber = phoneNumber.replaceAll("[^0-9]", "");
        
        // Nếu số điện thoại bắt đầu bằng 0, thay thế bằng +84
        if (cleanedNumber.startsWith("0")) {
            cleanedNumber = "+84" + cleanedNumber.substring(1);
        }
        
        // Nếu số điện thoại chưa có mã quốc gia, thêm +84
        if (!cleanedNumber.startsWith("+")) {
            cleanedNumber = "+84" + cleanedNumber;
        }
        
        return cleanedNumber;
    }
}
