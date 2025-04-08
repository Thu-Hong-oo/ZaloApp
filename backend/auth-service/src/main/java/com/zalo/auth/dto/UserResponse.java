package com.zalo.auth.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;

@Data
public class UserResponse {
    private boolean success;
    private String message;
    private UserData data;

    public static UserResponse fromString(String json) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(json, UserResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("Error parsing user JSON", e);
        }
    }

    @Override
    public String toString() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(this);
        } catch (Exception e) {
            throw new RuntimeException("Error converting user to JSON", e);
        }
    }
}
