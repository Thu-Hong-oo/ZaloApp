package com.zalo.auth.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;

import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.nio.charset.StandardCharsets;
import java.time.Duration;

import com.zalo.auth.dto.UserRegisterRequest;
import com.zalo.auth.dto.UserResponse;
import com.zalo.auth.dto.CheckPhoneResponse;
import com.zalo.auth.exception.ClientException;
import com.zalo.auth.exception.ServerException;

@Slf4j
@Service
public class UserServiceClient {
    
    private final WebClient webClient;
    private final String userServiceName;
    
    /**
     * Khởi tạo UserServiceClient với WebClient.Builder được cấu hình LoadBalanced
     * và tên service từ cấu hình
     * 
     * @param webClientBuilder WebClient.Builder được cấu hình LoadBalanced
     * @param userServiceName Tên service từ cấu hình (user.service.name)
     */
    public UserServiceClient(
            @LoadBalanced WebClient.Builder webClientBuilder,
            @Value("${user.service.name:USER-SERVICE}") String userServiceName) {
        this.userServiceName = userServiceName;
        log.info("Khởi tạo UserServiceClient với tên service: {}", userServiceName);
        
        // Cấu hình WebClient với các header mặc định và filter để log request/response
        this.webClient = webClientBuilder
            .baseUrl("http://" + userServiceName)
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
            .defaultHeader(HttpHeaders.ACCEPT_CHARSET, StandardCharsets.UTF_8.name())
            .filter(logRequest())
            .filter(logResponse())
            .build();
    }

    /**
     * Filter để log request trước khi gửi
     */
    private ExchangeFilterFunction logRequest() {
        return ExchangeFilterFunction.ofRequestProcessor(clientRequest -> {
            log.info("Yêu cầu: {} {}", clientRequest.method(), clientRequest.url());
            clientRequest.headers().forEach((name, values) -> 
                values.forEach(value -> log.debug("{}={}", name, value)));
            return Mono.just(clientRequest);
        });
    }

    /**
     * Filter để log response sau khi nhận
     */
    private ExchangeFilterFunction logResponse() {
        return ExchangeFilterFunction.ofResponseProcessor(clientResponse -> {
            log.info("Trạng thái phản hồi: {}", clientResponse.statusCode());
            return Mono.just(clientResponse);
        });
    }

    /**
     * Đăng ký người dùng mới
     * 
     * @param request Thông tin đăng ký người dùng
     * @return Mono<UserResponse> Kết quả đăng ký
     */
    public Mono<UserResponse> registerUser(UserRegisterRequest request) {
        log.info("Đang thử đăng ký người dùng với số điện thoại: {}", request.getPhone());
        
        return webClient
            .post()
            .uri("/api/users/register")  // Chuẩn hóa endpoint
            .bodyValue(request)
            .retrieve()
            .onStatus(status -> status.is4xxClientError(), response -> 
                response.bodyToMono(String.class)
                    .flatMap(body -> {
                        log.error("[{}] Lỗi client khi đăng ký: {}", userServiceName, body);
                        if (response.statusCode() == HttpStatus.CONFLICT) {
                            return Mono.error(new ClientException("Số điện thoại đã được đăng ký"));
                        }
                        return Mono.error(new ClientException("Lỗi đăng ký: " + body));
                    })
            )
            .onStatus(status -> status.is5xxServerError(), response ->
                response.bodyToMono(String.class)
                    .flatMap(body -> {
                        log.error("[{}] Lỗi server khi đăng ký: {}", userServiceName, body);
                        return Mono.error(new ServerException("Lỗi hệ thống, vui lòng thử lại sau"));
                    })
            )
            .bodyToMono(UserResponse.class)
            .timeout(Duration.ofSeconds(10))
            .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                .filter(throwable -> throwable instanceof ServerException)
                .doBeforeRetry(retrySignal -> 
                    log.warn("[{}] Đang thử lại đăng ký. Lần thử: {}/3", 
                        userServiceName, retrySignal.totalRetries() + 1)
                )
            )
            .doOnSuccess(response -> 
                log.info("[{}] Đăng ký thành công cho số điện thoại: {}", 
                    userServiceName, request.getPhone()))
            .doOnError(error -> 
                log.error("[{}] Đăng ký thất bại cho số điện thoại: {}", 
                    userServiceName, request.getPhone()));
    }

    /**
     * Lấy thông tin người dùng theo số điện thoại
     * 
     * @param phone Số điện thoại cần tìm
     * @return Mono<UserResponse> Thông tin người dùng
     */
    public Mono<UserResponse> getUserByPhone(String phone) {
        log.info("Đang lấy thông tin người dùng với số điện thoại: {}", phone);
        
        return webClient
            .get()
            .uri("/api/users/phone/{phone}", phone)  // Chuẩn hóa endpoint
            .retrieve()
            .onStatus(status -> status.is4xxClientError(), response -> 
                response.bodyToMono(String.class)
                    .flatMap(body -> {
                        log.error("[{}] Lỗi client khi lấy thông tin người dùng: {}", userServiceName, body);
                        return Mono.error(new ClientException("Không tìm thấy người dùng"));
                    })
            )
            .onStatus(status -> status.is5xxServerError(), response ->
                response.bodyToMono(String.class)
                    .flatMap(body -> {
                        log.error("[{}] Lỗi server khi lấy thông tin người dùng: {}", userServiceName, body);
                        return Mono.error(new ServerException("Lỗi hệ thống, vui lòng thử lại sau"));
                    })
            )
            .bodyToMono(UserResponse.class)
            .timeout(Duration.ofSeconds(10))
            .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                .filter(throwable -> throwable instanceof ServerException)
                .doBeforeRetry(retrySignal -> 
                    log.warn("[{}] Đang thử lại lấy thông tin người dùng. Lần thử: {}/3", 
                        userServiceName, retrySignal.totalRetries() + 1)
                )
            );
    }

    public Mono<Boolean> checkPhoneExists(String phone) {
        log.info("Đang kiểm tra số điện thoại: {}", phone);
        
        return webClient
            .get()
            .uri("/api/users/check-exists/{phone}", phone)
            .retrieve()
            .onStatus(status -> status.is4xxClientError(), response -> 
                response.bodyToMono(String.class)
                    .flatMap(body -> {
                        log.error("[{}] Lỗi client khi kiểm tra số điện thoại: {}", userServiceName, body);
                        return Mono.error(new ClientException("Lỗi khi kiểm tra số điện thoại"));
                    })
            )
            .onStatus(status -> status.is5xxServerError(), response ->
                response.bodyToMono(String.class)
                    .flatMap(body -> {
                        log.error("[{}] Lỗi server khi kiểm tra số điện thoại: {}", userServiceName, body);
                        return Mono.error(new ServerException("Lỗi hệ thống, vui lòng thử lại sau"));
                    })
            )
            .bodyToMono(CheckPhoneResponse.class)
            .map(response -> response.isExists())
            .timeout(Duration.ofSeconds(10))
            .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                .filter(throwable -> throwable instanceof ServerException)
                .doBeforeRetry(retrySignal -> 
                    log.warn("[{}] Đang thử lại kiểm tra số điện thoại. Lần thử: {}/3", 
                        userServiceName, retrySignal.totalRetries() + 1)
                )
            );
    }
} 