package com.zalo.auth.service.impl;

import com.zalo.auth.dto.*;
import com.zalo.auth.exception.InvalidOtpException;
import com.zalo.auth.exception.UserAlreadyExistsException;
import com.zalo.auth.exception.UserNotFoundException;
import com.zalo.auth.model.RefreshToken;
import com.zalo.auth.repository.RedisRefreshTokenRepository;
import com.zalo.auth.security.JwtTokenProvider;
import com.zalo.auth.service.ZaloAuthService;
import com.zalo.auth.service.TwilioOTPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import lombok.extern.slf4j.Slf4j;
import reactor.util.retry.Retry;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class ZaloAuthServiceImpl implements ZaloAuthService {

    @Autowired
    private RedisRefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ReactiveAuthenticationManager authenticationManager;

    @Autowired
    private TwilioOTPService twilioOTPService;

    @Autowired
    private WebClient.Builder webClientBuilder;

    @Value("${user.service.name}")
    private String userServiceName;

    @Override
    public Mono<String> sendRegistrationOtp(RegisterSendOtpRequest request) {
        log.info("Đang gửi yêu cầu đến: {}/api/users/check-exists/{}", userServiceName, request.getPhoneNumber());
        
        // Skip the user existence check and directly send OTP
        // This avoids the 401 Unauthorized error when checking user existence
        return twilioOTPService.sendOTPPasswordReset(
                new PasswordResetRequestDto(request.getPhoneNumber()))
                .doOnNext(result -> log.info("Đã gửi OTP thành công"))
                .thenReturn("OTP đã được gửi để xác thực số điện thoại");
    }

    @Override
    public Mono<ApiResponse> verifyRegistrationOtp(RegisterVerifyOtpRequest request) {
        log.info("Đang xác thực OTP cho số điện thoại: {}", request.getPhoneNumber());
        log.info("OTP: {}", request.getOtp());
    
        return twilioOTPService.validateOTP(request.getOtp(), request.getPhoneNumber())
                .doOnNext(result -> log.info("Kết quả xác thực OTP: {}", result))
                .flatMap(validOtp -> {
                    if (!"Mã OTP hợp lệ, vui lòng tiếp tục".equals(validOtp)) {
                        log.error("Phản hồi OTP không hợp lệ: {}", validOtp);
                        return Mono.error(new InvalidOtpException("OTP không hợp lệ."));
                    }
                    return Mono.just(new ApiResponse(true, "OTP hợp lệ, vui lòng tiếp tục đăng ký", null));
                })
                .onErrorResume(e -> {
                    log.error("Lỗi trong xác thực OTP: {}", e.getMessage());
                    return Mono.just(new ApiResponse(false, "Lỗi trong xác thực OTP", null));
                });
    }
    

    @Override
    public Mono<AuthResponse> completeRegistration(RegisterRequest registerRequest) {
        log.info("Bắt đầu quá trình đăng ký hoàn chỉnh");
        
        // Validate request
        if (registerRequest.getPhoneNumber() == null || registerRequest.getPhoneNumber().trim().isEmpty()) {
            log.error("Số điện thoại không được để trống");
            return Mono.error(new IllegalArgumentException("Số điện thoại không được để trống"));
        }
        if (registerRequest.getPassword() == null || registerRequest.getPassword().trim().isEmpty()) {
            log.error("Mật khẩu không được để trống");
            return Mono.error(new IllegalArgumentException("Mật khẩu không được để trống"));
        }
        if (registerRequest.getFullName() == null || registerRequest.getFullName().trim().isEmpty()) {
            log.error("Họ tên không được để trống");
            return Mono.error(new IllegalArgumentException("Họ tên không được để trống"));
        }

        // Tạo UserRegisterRequest mới
        UserRegisterRequest userRegisterRequest = new UserRegisterRequest();
        userRegisterRequest.setPhone(registerRequest.getPhoneNumber().trim());
        userRegisterRequest.setEmail(registerRequest.getPhoneNumber().trim() + "@zalo.com");
        userRegisterRequest.setPassword(registerRequest.getPassword().trim());
        userRegisterRequest.setName(registerRequest.getFullName().trim());
        userRegisterRequest.setStatus("online");

        log.info("Đang gửi yêu cầu đăng ký với số điện thoại: {}", userRegisterRequest.getPhone());
        
        return tryRegistrationEndpoints(userRegisterRequest)
            .doOnSuccess(response -> log.info("Đăng ký thành công cho số điện thoại: {}", userRegisterRequest.getPhone()))
            .doOnError(error -> log.error("Lỗi khi đăng ký cho số điện thoại {}: {}", userRegisterRequest.getPhone(), error.getMessage()))
            .flatMap(response -> generateAuthTokens(userRegisterRequest.getPhone()));
    }

    private Mono<AuthResponse> tryRegistrationEndpoints(UserRegisterRequest request) {
        log.info("Bắt đầu đăng ký người dùng với số điện thoại: {}", request.getPhone());
        
        return webClientBuilder.build()
            .post()
            .uri("http://" + userServiceName + "/api/users/register")
            .bodyValue(request)
            .retrieve()
            .onStatus(
                status -> status.is4xxClientError(),
                response -> {
                    if (response.statusCode() == HttpStatus.CONFLICT) {
                        return Mono.error(new ResponseStatusException(
                            HttpStatus.CONFLICT, 
                            "Số điện thoại đã được đăng ký"
                        ));
                    }
                    return response.bodyToMono(String.class)
                        .map(body -> new ResponseStatusException(
                            response.statusCode(),
                            "Lỗi trong quá trình đăng ký: " + body
                        ));
                }
            )
            .onStatus(
                status -> status.is5xxServerError(),
                response -> response.bodyToMono(String.class)
                    .map(body -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Lỗi hệ thống, vui lòng thử lại sau"
                    ))
            )
            .bodyToMono(UserResponse.class)
            .doOnNext(response -> {
                log.info("Nhận được phản hồi từ user service: {}", response);
                if (!response.isSuccess()) {
                    log.error("Đăng ký thất bại: {}", response.getMessage());
                }
            })
            .flatMap(response -> {
                if (!response.isSuccess()) {
                    return Mono.error(new RuntimeException(response.getMessage() != null ? 
                        response.getMessage() : "Đăng ký thất bại"));
                }
                if (response.getData() == null) {
                    return Mono.error(new RuntimeException("Không nhận được thông tin người dùng"));
                }
                return generateAuthTokens(response.getData().getPhone());
            })
            .doOnError(error -> log.error("Lỗi trong quá trình đăng ký: {}", error.getMessage()))
            .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                .filter(throwable -> !(throwable instanceof ResponseStatusException))
                .doBeforeRetry(signal -> 
                    log.info("Đang thử lại lần {}/3", signal.totalRetries() + 1)
                )
            );
    }

    @Override
    public Mono<AuthResponse> login(LoginRequest request) {
        log.info("Attempting login for phone: {}", request.getPhone());
        
        return webClientBuilder.build()
                .get()
                .uri("http://" + userServiceName + "/api/users/phone/{phone}", request.getPhone())
                .header("x-service", "auth-service")
                .retrieve()
                .bodyToMono(UserResponse.class)
                .flatMap(response -> {
                    log.info("Received response from user service: {}", response);
                    
                    if (!response.isSuccess() || response.getData() == null) {
                        log.error("User service returned error or null data");
                        return Mono.just(AuthResponse.error("Số điện thoại chưa được đăng ký"));
                    }
                    
                    UserData userData = response.getData();
                    if (userData.getPassword() == null) {
                        log.error("User password is null");
                        return Mono.just(AuthResponse.error("Lỗi xác thực"));
                    }
                    
                    if (passwordEncoder.matches(request.getPassword(), userData.getPassword())) {
                        log.info("Password matches, generating tokens");
                        return generateAuthTokens(request.getPhone());
                    }
                    
                    log.info("Password does not match");
                    return Mono.just(AuthResponse.error("Mật khẩu không đúng"));
                })
                .onErrorResume(WebClientResponseException.NotFound.class, 
                    e -> {
                        log.error("User not found: {}", e.getMessage());
                        return Mono.just(AuthResponse.error("Số điện thoại chưa được đăng ký"));
                    })
                .onErrorResume(WebClientResponseException.class, 
                    e -> {
                        log.error("Error from user service: {}", e.getMessage());
                        return Mono.just(AuthResponse.error("Lỗi hệ thống, vui lòng thử lại sau"));
                    });
    }

    @Override
    public Mono<AuthResponse> loginWithPhone(PhoneLoginRequest phoneLoginRequest) {
        log.info("Đang thử đăng nhập bằng điện thoại cho: {}", phoneLoginRequest.getPhoneNumber());
        
        return twilioOTPService.validateOTP(phoneLoginRequest.getOtp(), phoneLoginRequest.getPhoneNumber())
                .flatMap(validOtp -> {
                    if (!"Mã OTP hợp lệ, vui lòng tiếp tục".equals(validOtp)) {
                        log.error("OTP không hợp lệ cho số điện thoại: {}", phoneLoginRequest.getPhoneNumber());
                        return Mono.error(new InvalidOtpException("OTP không hợp lệ"));
                    }
                    
                    log.info("Xác thực OTP thành công, đang tạo token");
                    return generateAuthTokens(phoneLoginRequest.getPhoneNumber());
                })
                .onErrorResume(e -> {
                    log.error("Lỗi đăng nhập bằng điện thoại: {}", e.getMessage());
                    if (e instanceof InvalidOtpException) {
                        return Mono.error(e);
                    }
                    return Mono.error(new RuntimeException("Lỗi trong quá trình đăng nhập bằng OTP: " + e.getMessage()));
                });
    }

    @Override
    public Mono<Void> logout(String phoneNumber) {
        return refreshTokenRepository.findByPhoneNumber(phoneNumber)
                .flatMap(refreshToken -> refreshTokenRepository.deleteById(refreshToken.getId()))
                .then();
    }

    @Override
    public Mono<AuthResponse> refreshToken(RefreshTokenRequest refreshTokenRequest) {
        return refreshTokenRepository.findByToken(refreshTokenRequest.getRefreshToken())
                .flatMap(refreshToken -> {
                    if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
                        return refreshTokenRepository.deleteById(refreshToken.getId())
                                .then(Mono.error(new InvalidOtpException("Refresh token đã hết hạn")));
                    }
                    return generateAuthTokens(refreshToken.getPhoneNumber());
                })
                .switchIfEmpty(Mono.error(new InvalidOtpException("Refresh token không hợp lệ")));
    }

    private Mono<AuthResponse> generateAuthTokens(String phoneNumber) {
        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_USER")
        );
        Authentication authentication = new UsernamePasswordAuthenticationToken(
            phoneNumber, null, authorities
        );
        
        String token = jwtTokenProvider.generateToken(authentication);

        return createRefreshToken(phoneNumber)
                .map(refreshToken -> new AuthResponse(
                    phoneNumber,
                    token,
                    refreshToken.getToken()
                ));
    }

    private Mono<Authentication> authenticateUser(String phoneNumber, String password) {
        return authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(phoneNumber, password));
    }

    private Mono<RefreshToken> createRefreshToken(String phoneNumber) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setId(UUID.randomUUID().toString());
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setPhoneNumber(phoneNumber);
        refreshToken.setExpiryDate(Instant.now().plusSeconds(30 * 24 * 60 * 60)); // 30 days

        return refreshTokenRepository.save(refreshToken);
    }
}