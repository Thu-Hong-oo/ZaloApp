package com.zalo.auth.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zalo.auth.model.RefreshToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Repository
public class RedisRefreshTokenRepository {
    private static final Duration TOKEN_EXPIRY = Duration.ofDays(30);
    private static final String TOKEN_PREFIX = "refresh_token:";
    private static final String TOKEN_BY_PHONE_PREFIX = "refresh_token_by_phone:";
    private final ReactiveRedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public RedisRefreshTokenRepository(ReactiveRedisTemplate<String, String> redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public Mono<RefreshToken> save(RefreshToken refreshToken) {
        try {
            String tokenKey = TOKEN_PREFIX + refreshToken.getToken();
            String phoneKey = TOKEN_BY_PHONE_PREFIX + refreshToken.getPhoneNumber();
            String tokenJson = objectMapper.writeValueAsString(refreshToken);

            return redisTemplate.opsForValue()
                    .set(tokenKey, tokenJson, TOKEN_EXPIRY)
                    .then(redisTemplate.opsForValue()
                            .set(phoneKey, tokenJson, TOKEN_EXPIRY))
                    .thenReturn(refreshToken);
        } catch (Exception e) {
            return Mono.error(new RuntimeException("Error saving refresh token", e));
        }
    }

    public Mono<RefreshToken> findByToken(String token) {
        String key = TOKEN_PREFIX + token;
        return redisTemplate.opsForValue()
                .get(key)
                .flatMap(json -> {
                    try {
                        return Mono.just(objectMapper.readValue(json, RefreshToken.class));
                    } catch (Exception e) {
                        return Mono.error(new RuntimeException("Error deserializing refresh token", e));
                    }
                });
    }

    public Mono<RefreshToken> findByPhoneNumber(String phoneNumber) {
        String key = TOKEN_BY_PHONE_PREFIX + phoneNumber;
        return redisTemplate.opsForValue()
                .get(key)
                .flatMap(json -> {
                    try {
                        return Mono.just(objectMapper.readValue(json, RefreshToken.class));
                    } catch (Exception e) {
                        return Mono.error(new RuntimeException("Error deserializing refresh token", e));
                    }
                });
    }

    public Mono<Void> deleteById(String id) {
        return findByToken(id)
                .flatMap(token -> {
                    String tokenKey = TOKEN_PREFIX + token.getToken();
                    String phoneKey = TOKEN_BY_PHONE_PREFIX + token.getPhoneNumber();
                    return redisTemplate.delete(tokenKey)
                            .then(redisTemplate.delete(phoneKey))
                            .then();
                })
                .switchIfEmpty(Mono.empty());
    }
}