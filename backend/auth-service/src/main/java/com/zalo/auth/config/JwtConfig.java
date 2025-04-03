package com.zalo.auth.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import java.security.SecureRandom;
import java.util.Base64;

@Configuration
public class JwtConfig {
    
    @Value("${jwt.expiration:3600000}")
    private long expiration;
    
    @Value("${jwt.refresh-expiration:86400000}")
    private long refreshExpiration;
    
    @Value("${jwt.secret:defaultSecretKey123!@#}")
    private String secret;
    
    @Bean
    public String jwtSecret() {
        return secret;
    }
    
    public long getExpiration() {
        return expiration;
    }
    
    public long getRefreshExpiration() {
        return refreshExpiration;
    }
}