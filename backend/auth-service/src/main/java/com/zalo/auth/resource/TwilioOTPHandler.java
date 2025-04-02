package com.zalo.auth.resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;

import com.zalo.auth.dto.PasswordResetRequestDto;
import com.zalo.auth.dto.VerifyOtpRequest;
import com.zalo.auth.service.TwilioOTPService;

import reactor.core.publisher.Mono;

@Component
public class TwilioOTPHandler {

    @Autowired
    private TwilioOTPService service;

    // Gửi OTP dựa trên số điện thoại
    public Mono<ServerResponse> sendOTP(ServerRequest serverRequest) {
        return serverRequest.bodyToMono(PasswordResetRequestDto.class)
            .flatMap(dto -> service.sendOTPPasswordReset(dto)) // Gửi OTP dựa vào số điện thoại
            .flatMap(response -> ServerResponse.ok().body(BodyInserters.fromValue(response)))
            .onErrorResume(e -> ServerResponse.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .bodyValue("Lỗi khi gửi OTP: " + e.getMessage()));
    }

    // Xác thực OTP dựa trên số điện thoại và mã OTP
    public Mono<ServerResponse> validateOTP(ServerRequest serverRequest) {
        return serverRequest.bodyToMono(VerifyOtpRequest.class)
            .flatMap(dto -> service.validateOTP(dto.getOtp(), dto.getPhoneNumber()))
            .flatMap(response -> ServerResponse.ok().bodyValue(response))
            .onErrorResume(e -> ServerResponse.status(HttpStatus.BAD_REQUEST)
                .bodyValue("OTP không hợp lệ: " + e.getMessage()));
    }
}
