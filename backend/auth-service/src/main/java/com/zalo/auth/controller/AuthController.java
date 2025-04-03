package com.zalo.auth.controller;

import com.zalo.auth.dto.*;
import com.zalo.auth.service.TwilioOTPService;
import com.zalo.auth.service.ZaloAuthService;
import com.zalo.auth.config.JwtConfig;
import com.zalo.auth.security.JwtTokenProvider;

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

    @Autowired
    private JwtConfig jwtConfig;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @GetMapping("/jwt-secret")
    public Mono<ResponseEntity<JwtSecretResponse>> getJwtSecret() {
        JwtSecretResponse response = new JwtSecretResponse();
        response.setSecret(jwtConfig.jwtSecret());
        return Mono.just(ResponseEntity.ok(response));
    }

    @GetMapping("/validate-token")
    public Mono<ResponseEntity<ApiResponse>> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, "Invalid token format", null)));
            }

            String token = authHeader.substring(7);
            if (jwtTokenProvider.validateToken(token)) {
                Authentication auth = jwtTokenProvider.getAuthentication(token);
                return Mono.just(ResponseEntity.ok(new ApiResponse(true, "Token is valid", new TokenValidationResponse(
                    auth.getName(),
                    auth.getAuthorities().stream().findFirst().map(a -> a.getAuthority()).orElse("user")
                ))));
            } else {
                return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, "Invalid token", null)));
            }
        } catch (Exception e) {
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse(false, "Token validation failed: " + e.getMessage(), null)));
        }
    }

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