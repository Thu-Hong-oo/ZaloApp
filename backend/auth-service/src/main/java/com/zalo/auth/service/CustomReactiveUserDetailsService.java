package com.zalo.auth.service;

import com.zalo.auth.dto.UserResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Collections;

@Service
public class CustomReactiveUserDetailsService implements ReactiveUserDetailsService {

    @Autowired
    private WebClient.Builder webClientBuilder;

    @Value("${user.service.url:http://localhost:3000}")
    private String userServiceUrl;

    @Override
    public Mono<UserDetails> findByUsername(String phoneNumber) {
        return webClientBuilder.build()
                .get()
                .uri(userServiceUrl + "/api/users/" + phoneNumber)
                .retrieve()
                .bodyToMono(UserResponse.class)
                .map(response -> new User(
                        response.getData().getPhone(),
                        response.getData().getPassword(),
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                ))
                .cast(UserDetails.class)
                .switchIfEmpty(Mono.empty());
    }
} 