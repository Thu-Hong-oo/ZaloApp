package com.zalo.auth.service;

import java.text.DecimalFormat;
import java.time.Duration;
import java.util.Random;
import java.util.concurrent.TimeUnit;

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
import com.twilio.exception.TwilioException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import reactor.core.publisher.Mono;

@Service
public class TwilioOTPService {

    private static final Logger log = LoggerFactory.getLogger(TwilioOTPService.class);

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
                        // Log OTP instead of sending SMS
                        System.out.println("OTP for " + phoneNumber + " is: " + otp);
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
                                    .then(Mono.error(new InvalidOtpException("Mã OTP không hợp lệ")));
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
        // Remove any non-digit characters
        String digitsOnly = phoneNumber.replaceAll("\\D", "");
        
        // If the number starts with 0, remove it
        if (digitsOnly.startsWith("0")) {
            digitsOnly = digitsOnly.substring(1);
        }
        
        // If the number already has the country code, return as is
        return digitsOnly.startsWith("+") ? digitsOnly : "+84" + digitsOnly;
    }

    public Mono<String> sendOTPForPasswordReset(String phoneNumber) {
        String rateLimitKey = "otp_ratelimit:" + phoneNumber;
        return redisTemplate.opsForValue()
            .setIfAbsent(rateLimitKey, "1", Duration.ofMinutes(1))
            .flatMap(canSendOTP -> {
                if (Boolean.FALSE.equals(canSendOTP)) {
                    return redisTemplate.getExpire(rateLimitKey)
                        .map(ttl -> "Please wait " + ttl.getSeconds() + " seconds before requesting another OTP")
                        .flatMap(msg -> Mono.error(new RuntimeException(msg)));
                }

                String formattedNumber = formatPhoneNumber(phoneNumber);
                if (formattedNumber.length() < 10 || formattedNumber.length() > 12) {
                    return Mono.error(new RuntimeException("Invalid phone number format"));
                }

                String otp = generateOTP();
                try {
                    Message message = Message.creator(
                            new PhoneNumber(formattedNumber),
                            new PhoneNumber(twilioConfig.getPhoneNumber()),
                            "Your ZaloApp OTP is: " + otp)
                        .create();

                    // Store OTP in Redis with 5 minutes expiration
                    String otpKey = "otp:" + phoneNumber;
                    return redisTemplate.opsForValue()
                        .set(otpKey, otp, Duration.ofMinutes(5))
                        .thenReturn("OTP sent successfully to " + phoneNumber);
                } catch (TwilioException e) {
                    log.error("Failed to send OTP via Twilio", e);
                    return Mono.error(new RuntimeException("Failed to send OTP: " + e.getMessage()));
                }
            })
            .onErrorMap(e -> {
                log.error("Error in OTP service", e);
                return new RuntimeException("Error processing OTP request: " + e.getMessage());
            });
    }
}
