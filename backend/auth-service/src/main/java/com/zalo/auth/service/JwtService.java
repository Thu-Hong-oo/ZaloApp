package com.zalo.auth.service;

import io.jsonwebtoken.Claims;
import java.util.Map;
import java.util.function.Function;

public interface JwtService {
    String extractUsername(String token);
    <T> T extractClaim(String token, Function<Claims, T> claimsResolver);
    String generateToken(String username);
    String generateToken(Map<String, Object> extraClaims, String username);
    String generateRefreshToken(String username);
    boolean isTokenValid(String token, String username);
} 