package com.zalo.auth.dto;


import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class UserRegisterRequest {
    private String email;
    private String phone;
    private String password;
    private String name;
    private String avatar = null;  // Optional, default null as per Node.js service
    private String status = "online";  // Default status as per Node.js service
} 