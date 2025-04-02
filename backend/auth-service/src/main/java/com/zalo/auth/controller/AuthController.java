package com.zalo.auth.controller;

import com.zalo.auth.dto.*;
import com.zalo.auth.service.TwilioOTPService;
import com.zalo.auth.service.ZaloAuthService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private ZaloAuthService authService;

    @Autowired
    private TwilioOTPService twilioOTPService;

    @PostMapping("/register/send-otp")
    public Mono<ResponseEntity<String>> sendRegistrationOtp(@Valid @RequestBody RegisterSendOtpRequest request) {
        return authService.sendRegistrationOtp(request)
                .map(response -> ResponseEntity.ok(response));
    }

    @PostMapping("/register/verify-otp")
    public Mono<ResponseEntity<String>> verifyRegistrationOtp(@Valid @RequestBody RegisterVerifyOtpRequest request) {
        return authService.verifyRegistrationOtp(request)
                .map(response -> ResponseEntity.ok(response));
    }

    @PostMapping("/register/complete")
    public Mono<ResponseEntity<AuthResponse>> completeRegistration(@Valid @RequestBody RegisterRequest request) {
        return authService.completeRegistration(request)
                .map(response -> ResponseEntity.status(HttpStatus.CREATED).body(response));
    }

    @PostMapping("/login")
    public Mono<ResponseEntity<AuthResponse>> login(@Valid @RequestBody AuthRequest authRequest) {
        return authService.login(authRequest)
                .map(response -> ResponseEntity.ok(response));
    }

    @PostMapping("/login/phone")
    public Mono<ResponseEntity<AuthResponse>> loginWithPhone(@Valid @RequestBody PhoneLoginRequest phoneLoginRequest) {
        return authService.loginWithPhone(phoneLoginRequest)
                .map(response -> ResponseEntity.ok(response));
    }

    @PostMapping("/send-otp")
    public Mono<ResponseEntity<PasswordResetResponseDto>> sendOTP(@Valid @RequestBody PasswordResetRequestDto passwordResetRequestDto) {
        return twilioOTPService.sendOTPPasswordReset(passwordResetRequestDto)
                .map(response -> ResponseEntity.ok(response));
    }

    @PostMapping("/logout")
    public Mono<ResponseEntity<Void>> logout(Authentication authentication) {
        return authService.logout(authentication.getName())
                .then(Mono.just(ResponseEntity.ok().<Void>build()));
    }

    @PostMapping("/refresh-token")
    public Mono<ResponseEntity<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshTokenRequest) {
        return authService.refreshToken(refreshTokenRequest)
                .map(response -> ResponseEntity.ok(response));
    }
}