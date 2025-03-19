package com.zalo.auth.dto;

import lombok.Data;

@Data
public class PasswordResetRequestDto {
    private String phoneNumber;
    private String userName;
    private String oneTimePassword;
    
}
