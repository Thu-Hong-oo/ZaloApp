package com.zalo.auth.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserProfileDto {
    private String id;
    private String username;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String avatar;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 