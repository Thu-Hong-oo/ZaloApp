package com.example.authservice.service;


import com.example.authservice.dto.request.ForgotPasswordRequest;
import com.example.authservice.dto.request.LoginRequest;
import com.example.authservice.dto.request.RegisterRequest;
import com.example.authservice.dto.request.ResetPasswordRequest;
import com.example.authservice.dto.response.AuthResponse;
import com.example.authservice.dto.response.MessageResponse;

public interface AuthService {
    AuthResponse authenticateUser(LoginRequest loginRequest);
    MessageResponse registerUser(RegisterRequest registerRequest);
    MessageResponse processForgotPassword(ForgotPasswordRequest forgotPasswordRequest);
    MessageResponse resetPassword(ResetPasswordRequest resetPasswordRequest);
    boolean validatePasswordResetToken(String token);
}