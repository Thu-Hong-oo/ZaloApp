package com.zalo.auth.service;

import java.text.DecimalFormat;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.stereotype.Service;

import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import com.zalo.auth.config.TwilioConfig;
import com.zalo.auth.dto.OTPStatus;
import com.zalo.auth.dto.PasswordResetRequestDto;
import com.zalo.auth.dto.PasswordResetResponseDto;

import reactor.core.publisher.Mono;

@Service
public class TwilioOTPService {

    @Autowired
    private TwilioConfig twilioConfig;
    // Problem : just save in RAM, not auto delete after 5 mins, not synchronized
    // between servers
    // Map<String, String> otpMap = new HashMap<>();
    @Autowired
    private ReactiveStringRedisTemplate redisTemplate;

    public Mono<PasswordResetResponseDto> sendOTPPasswordReset(PasswordResetRequestDto passwordResetRequestDto) {

        PasswordResetResponseDto passwordResetResponseDto = null;
        try {
            PhoneNumber to = new PhoneNumber(passwordResetRequestDto.getPhoneNumber());
            PhoneNumber from = new PhoneNumber(twilioConfig.getTrialNumber());
            String otp = generateOTP();
            String otpMessage = "Your OTP is: " + otp;
            Message message = Message.creator(to, from, // from
                    otpMessage).create();

            // otpMap.put(passwordResetRequestDto.getUserName(), otp);
            // Lưu OTP vào Redis với thời gian sống là 5 phút
            redisTemplate.opsForValue()
                    .set(passwordResetRequestDto.getUserName(), otp, Duration.ofMinutes(5))
                    .doOnSuccess(success -> System.out
                            .println("Saved OTP for " + passwordResetRequestDto.getUserName() + ": " + otp))
                    .subscribe();

            passwordResetResponseDto = new PasswordResetResponseDto(OTPStatus.DELIVERED,
                    "OTP sent successfully : " + otp);
        } catch (Exception e) {
            passwordResetResponseDto = new PasswordResetResponseDto(OTPStatus.FAILED, e.getMessage());
        }
        return Mono.just(passwordResetResponseDto);

    }

    public Mono<String> validateOTP(String userInputOtp, String userName) {
        return redisTemplate.opsForValue().get(userName)
                .flatMap(storedOtp -> {
                    if (storedOtp != null && storedOtp.equals(userInputOtp)) {
                        // Xóa OTP sau khi xác thực thành công
                        return redisTemplate.opsForValue().delete(userName)
                                .then(Mono.just("Valid OTP, please proceed with your transaction"));
                    } else {
                        return Mono.error(new IllegalArgumentException("Invalid OTP, please retry"));
                    }
                });
    }

    // public Mono<String> validateOTP(String userInputOtp, String userName) {
    // if (userInputOtp.equals(otpMap.get(userName))) {
    // otpMap.remove(userName,userInputOtp);
    // return Mono.just("Valid OTP please proceed with your transaction");
    // } else {
    // return Mono.error(new IllegalArgumentException("Invalid otp please retry"));

    // }
    // }

    // 6 digits
    private String generateOTP() {
        return new DecimalFormat("000000").format(new Random().nextInt(999999));

    }
}
