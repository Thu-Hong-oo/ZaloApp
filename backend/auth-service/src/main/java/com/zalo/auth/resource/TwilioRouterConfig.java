package com.zalo.auth.resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;

import com.zalo.auth.ZaloAppAuthService;

@Configuration
public class TwilioRouterConfig {

    @Autowired
    private TwilioOTPHandler handler;

    @Bean
    public RouterFunction<ServerResponse> handleSMS() {

        return RouterFunctions.route()
                .POST("/router/sendOTP", handler::sendOTP)
                .POST("/router/validateOTP", handler::validateOTP)
                .build();

    }
}
