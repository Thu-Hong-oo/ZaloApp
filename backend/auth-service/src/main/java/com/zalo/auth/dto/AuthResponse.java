package com.zalo.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String phoneNumber;
    private String accessToken;
    private String refreshToken;
    private String error;
    private boolean success;

    public AuthResponse(String phoneNumber, String accessToken, String refreshToken) {
        this.phoneNumber = phoneNumber;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.success = true;
        this.error = null;
    }

    public static AuthResponse error(String message) {
        AuthResponse response = new AuthResponse();
        response.setSuccess(false);
        response.setError(message);
        return response;
    }
}
