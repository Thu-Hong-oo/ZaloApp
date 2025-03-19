package com.zalo.auth.resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;

import com.zalo.auth.dto.PasswordResetRequestDto;
import com.zalo.auth.service.TwilioOTPService;

import reactor.core.publisher.Mono;

@Component
public class TwilioOTPHandler {

    @Autowired
    private TwilioOTPService service;

    // Gửi OTP
    public Mono<ServerResponse> sendOTP(ServerRequest serverRequest) {
        return serverRequest.bodyToMono(PasswordResetRequestDto.class)
            .flatMap(service::sendOTPPasswordReset)
            .flatMap(response -> ServerResponse.ok().body(BodyInserters.fromValue(response)))
            .onErrorResume(e -> ServerResponse.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .bodyValue("Error while sending OTP: " + e.getMessage()));
    }

    // Xác thực OTP
    public Mono<ServerResponse> validateOTP(ServerRequest serverRequest) {
        return serverRequest.bodyToMono(PasswordResetRequestDto.class)
            .flatMap(dto -> service.validateOTP(dto.getOneTimePassword(), dto.getUserName()))
            .flatMap(response -> ServerResponse.ok().bodyValue(response))
            .onErrorResume(e -> ServerResponse.status(HttpStatus.BAD_REQUEST)
                .bodyValue("Invalid OTP: " + e.getMessage()));
    }
}

// package com.example.demo.resource;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpStatus;
// import org.springframework.stereotype.Component;
// import org.springframework.web.reactive.function.BodyInserters;
// import org.springframework.web.reactive.function.server.ServerRequest;
// import org.springframework.web.reactive.function.server.ServerResponse;

// import com.example.demo.dto.PasswordResetRequestDto;
// import com.example.demo.service.TwilioOTPService;

// import reactor.core.publisher.Mono;

// @Component
// public class TwilioOTPHandler {

// @Autowired
//    private TwilioOTPService service;
//    //Reactive = Asynchronous + Non-Blocking I/O (NIO)
// //use mono<ServerResponse> help to process non-blocking
//     public Mono<ServerResponse> sendOTP(ServerRequest serverRequest) {

//         return serverRequest.bodyToMono(PasswordResetRequestDto.class).flatMap(dto -> service.sendOTPPasswordReset(dto))//get content from request body, convert to Mono<PasswordResetRequestDto> (reactive)
//                 .flatMap(dto -> ServerResponse.status(HttpStatus.OK).body(BodyInserters.fromValue(dto)));//send request create OTP by TwilioOTPService, send response back to client(content dto )

//     }

//     public Mono<ServerResponse> validateOTP(ServerRequest serverRequest){
//         return serverRequest.bodyToMono(PasswordResetRequestDto.class).flatMap(dto -> service.validateOTP(dto.getOneTimePassword(),dto.getUserName()))//convert request body to Mono<PasswordResetRequestDto>
//         .flatMap(dto -> ServerResponse.status(HttpStatus.OK).bodyValue(dto));
//     }

// }
