package com.zalo.auth.controller;

import com.zalo.auth.dto.*;
import com.zalo.auth.service.TwilioOTPService;
import com.zalo.auth.service.ZaloAuthService;
import com.zalo.auth.config.JwtConfig;
import com.zalo.auth.security.JwtTokenProvider;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.beans.factory.annotation.Value;

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

    @Value("${user.service.name}")
    private String userServiceName;

    @Autowired
    private WebClient.Builder webClientBuilder;

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
    public Mono<ResponseEntity<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(AuthResponse.error(e.getMessage()))));
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
    public Mono<ResponseEntity<ApiResponse>> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String phone = jwtTokenProvider.getUsernameFromToken(token);
            return authService.logout(phone)
                    .then(Mono.just(ResponseEntity.ok(new ApiResponse(true, "Đăng xuất thành công", null))));
        }
        return Mono.just(ResponseEntity.ok(new ApiResponse(true, "Đăng xuất thành công", null)));
    }

    @PostMapping("/refresh-token")
    public Mono<ResponseEntity<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refreshToken(request)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(AuthResponse.error(e.getMessage()))));
    }

    @PutMapping("/users/status")
    public Mono<ResponseEntity<ApiResponse>> updateStatus(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody UpdateStatusRequest request) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse(false, "Token không hợp lệ", null)));
        }

        String token = authHeader.substring(7);
        String phone = jwtTokenProvider.getUsernameFromToken(token);
        
        return webClientBuilder.build()
            .put()
            .uri("http://" + userServiceName + "/api/users/" + phone + "/status")
            .bodyValue(request)
            .retrieve()
            .toBodilessEntity()
            .map(response -> ResponseEntity.ok(new ApiResponse(true, "Cập nhật trạng thái thành công", null)))
            .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse(false, "Lỗi khi cập nhật trạng thái: " + e.getMessage(), null))));
    }
}