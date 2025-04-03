package com.zalo.auth.dto;

import lombok.Data;

@Data
public class UserData {
    private String phone;
    private String name;
    private String password;
    private String status;
    private String role;
    private String avatar;
    private String lastSeen;
    private String createdAt;
    private String updatedAt;
} 