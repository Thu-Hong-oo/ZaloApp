package com.zalo.auth.dto;

import lombok.Data;

@Data
public class UserExistsResponse {
    private boolean exists;
    private String field;
    private String message;
} 