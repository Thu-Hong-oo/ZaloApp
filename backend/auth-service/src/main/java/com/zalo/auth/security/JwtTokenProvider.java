package com.zalo.auth.security;

import com.zalo.auth.config.JwtConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    @Autowired
    private JwtConfig jwtConfig;

    public String generateToken(Authentication authentication) {
        String username = authentication.getName();
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("authorities", authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtConfig.getExpiration());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(SignatureAlgorithm.HS256, jwtConfig.jwtSecret().getBytes())
                .compact();
    }

    public String generateTokenFromUsername(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtConfig.getExpiration());

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(SignatureAlgorithm.HS256, jwtConfig.jwtSecret().getBytes())
                .compact();
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(jwtConfig.jwtSecret().getBytes())
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(jwtConfig.jwtSecret().getBytes())
                .parseClaimsJws(token)
                .getBody();
    
        String username = claims.getSubject();
    
        // Lấy danh sách authorities dưới dạng List<String>
        Object authoritiesObj = claims.get("authorities");
        List<String> authorities = authoritiesObj instanceof List ? (List<String>) authoritiesObj : new ArrayList<>();
    
        List<GrantedAuthority> grantedAuthorities = authorities.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    
        return new UsernamePasswordAuthenticationToken(username, "", grantedAuthorities);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .setSigningKey(jwtConfig.jwtSecret().getBytes())
                .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String generateTokenFromPhone(String phoneNumber) {
        return generateToken(new UsernamePasswordAuthenticationToken(phoneNumber, null, Collections.emptyList()));
    }
}