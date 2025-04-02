package com.zalo.auth.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String phoneNumber;
    private String accessToken;
    private String refreshToken;
}
