package com.example.authservice.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;

    public AuthResponse(String token, String username) {
        this.token = token;
        this.username = username;
    }
    

    public AuthResponse(String token, Long id, String username) {
        this.token = token;
        this.id = id;
        this.username = username;

    }
}
