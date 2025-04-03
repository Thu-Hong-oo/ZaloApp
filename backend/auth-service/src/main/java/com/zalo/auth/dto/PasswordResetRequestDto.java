package com.zalo.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PasswordResetRequestDto {
    private String phoneNumber; // Số điện thoại cần gửi OTP
}
