package com.zalo.apigateway.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/cors")
    public Mono<String> testCors() {
        return Mono.just("CORS is working correctly!");
    }
} 