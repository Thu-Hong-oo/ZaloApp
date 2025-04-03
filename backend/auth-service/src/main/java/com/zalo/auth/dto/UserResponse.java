package com.zalo.auth.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;

@Data
public class UserResponse {
    private String id;
    private String email;
    private String phone;
    private String name;
    private String avatar;
    private String password;

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
