package com.zalo.auth.service;

import com.zalo.auth.dto.*;
import reactor.core.publisher.Mono;

public interface ZaloAuthService {
    Mono<String> sendRegistrationOtp(RegisterSendOtpRequest request);
    Mono<ApiResponse> verifyRegistrationOtp(RegisterVerifyOtpRequest request);
    Mono<AuthResponse> completeRegistration(RegisterRequest registerRequest);
    Mono<AuthResponse> login(LoginRequest request);
    Mono<AuthResponse> loginWithPhone(PhoneLoginRequest phoneLoginRequest);
    Mono<Void> logout(String phoneNumber);
    Mono<AuthResponse> refreshToken(RefreshTokenRequest request);
}
