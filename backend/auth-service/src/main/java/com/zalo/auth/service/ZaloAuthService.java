package com.zalo.auth.service;

import com.zalo.auth.dto.*;
import reactor.core.publisher.Mono;

public interface ZaloAuthService {
    // Quy trình đăng ký
    Mono<String> sendRegistrationOtp(RegisterSendOtpRequest request);// Gửi OTP đăng ký
    Mono<ApiResponse> verifyRegistrationOtp(RegisterVerifyOtpRequest request);// Xác thực OTP đăng ký
    Mono<AuthResponse> completeRegistration(RegisterRequest registerRequest);// Hoàn tất đăng ký

    // Quy trình đăng nhập
    Mono<AuthResponse> login(LoginRequest request);//Đăng nhập thông thường
    Mono<AuthResponse> loginWithPhone(PhoneLoginRequest phoneLoginRequest);//Đăng nhập bằng số điện thoại
   
    // Quản lý phiên đăng nhập
    Mono<Void> logout(String phoneNumber);//Đăng xuất
    Mono<AuthResponse> refreshToken(RefreshTokenRequest request);//Làm mới token
}
