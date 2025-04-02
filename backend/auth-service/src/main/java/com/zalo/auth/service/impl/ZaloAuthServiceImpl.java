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
        
        return webClientBuilder.build().get()
                .uri("http://" + userServiceName + "/api/users/check-exists/" + request.getPhoneNumber())
                .exchangeToMono(response -> {
                    log.info("Trạng thái phản hồi: {}", response.statusCode());
                    
                    if (response.statusCode().is4xxClientError()) {
                        log.info("Nhận được lỗi 4xx, xử lý như người dùng không tồn tại");
                        return twilioOTPService.sendOTPPasswordReset(
                                new PasswordResetRequestDto(request.getPhoneNumber()))
                                .doOnNext(result -> log.info("Đã gửi OTP thành công"))
                                .thenReturn("OTP đã được gửi để xác thực số điện thoại");
                    }
                    
                    if (response.statusCode().is2xxSuccessful()) {
                        return response.bodyToMono(String.class)
                                .doOnNext(body -> log.info("Nội dung phản hồi: {}", body))
                                .flatMap(body -> {
                                    log.info("Đang xử lý nội dung phản hồi");
                                    if (body.contains("\"exists\":false") || body.contains("not found")) {
                                        log.info("Người dùng không tồn tại, đang gửi OTP");
                                        return twilioOTPService.sendOTPPasswordReset(
                                                new PasswordResetRequestDto(request.getPhoneNumber()))
                                                .doOnNext(result -> log.info("Đã gửi OTP thành công"))
                                                .thenReturn("OTP đã được gửi để xác thực số điện thoại");
                                    }
                                    log.info("Người dùng đã tồn tại, trả về lỗi");
                                    return Mono.error(new UserAlreadyExistsException("Số điện thoại đã đăng ký. Vui lòng đăng nhập."));
                                })
                                .onErrorResume(e -> {
                                    log.error("Lỗi khi xử lý phản hồi: {}", e.getMessage());
                                    return Mono.error(new RuntimeException("Lỗi khi xử lý phản hồi: " + e.getMessage()));
                                });
                    }
                    
                    log.error("Mã trạng thái không mong đợi: {}", response.statusCode());
                    return Mono.error(new RuntimeException("Lỗi khi kiểm tra số điện thoại: " + response.statusCode()));
                })
                .onErrorResume(e -> {
                    log.error("Lỗi trong yêu cầu: {}", e.getMessage());
                    if (e instanceof UserAlreadyExistsException) {
                        return Mono.error(e);
                    }
                    log.info("Đang thử gửi OTP trực tiếp do lỗi");
                    return twilioOTPService.sendOTPPasswordReset(
                            new PasswordResetRequestDto(request.getPhoneNumber()))
                            .doOnNext(result -> log.info("Đã gửi OTP thành công như phương án dự phòng"))
                            .thenReturn("OTP đã được gửi để xác thực số điện thoại");
                });
    }

    @Override
    public Mono<String> verifyRegistrationOtp(RegisterVerifyOtpRequest request) {
        log.info("Đang xác thực OTP cho số điện thoại: {}", request.getPhoneNumber());
        log.info("OTP: {}", request.getOtp());
        
        return twilioOTPService.validateOTP(request.getOtp(), request.getPhoneNumber())
                .doOnNext(result -> log.info("Kết quả xác thực OTP: {}", result))
                .doOnError(error -> log.error("Lỗi xác thực OTP: {}", error.getMessage()))
                .flatMap(validOtp -> {
                    if (!"Mã OTP hợp lệ, vui lòng tiếp tục".equals(validOtp)) {
                        log.error("Phản hồi OTP không hợp lệ: {}", validOtp);
                        return Mono.error(new InvalidOtpException("OTP không hợp lệ."));
                    }
                    return Mono.just("OTP hợp lệ, vui lòng tiếp tục đăng ký");
                })
                .onErrorResume(e -> {
                    log.error("Lỗi trong xác thực OTP: {}", e.getMessage());
                    return Mono.error(e);
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
        log.info("Bắt đầu đăng ký người dùng");
        
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
            .doOnSuccess(response -> log.info("Đăng ký thành công cho số điện thoại: {}", request.getPhone()))
            .doOnError(error -> {
                if (error instanceof ResponseStatusException) {
                    log.warn("Không thể đăng ký: {}", error.getMessage());
                } else {
                    log.error("Lỗi khi đăng ký cho số điện thoại {}: {}", 
                        request.getPhone(), error.getMessage());
                }
            })
            .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                .filter(throwable -> !(throwable instanceof ResponseStatusException))
                .doBeforeRetry(signal -> 
                    log.info("Đang thử lại lần {}/3", signal.totalRetries() + 1)
                )
            )
            .onErrorResume(ResponseStatusException.class, error -> {
                if (error.getStatusCode() == HttpStatus.CONFLICT) {
                    return Mono.error(error); // Trả về lỗi conflict ngay lập tức
                }
                return Mono.error(new RuntimeException(error.getReason()));
            })
            .flatMap(userResponse -> generateAuthTokens(userResponse.getPhone()));
    }

    @Override
    public Mono<AuthResponse> login(AuthRequest authRequest) {
        log.info("Đang thử đăng nhập cho số điện thoại: {}", authRequest.getPhoneNumber());
        
        return webClientBuilder.build().post()
                .uri("http://" + userServiceName + "/api/users/login")
                .bodyValue(authRequest)
                .exchangeToMono(response -> {
                    log.info("Trạng thái phản hồi đăng nhập: {}", response.statusCode());
                    
                    if (response.statusCode().is2xxSuccessful()) {
                        return response.bodyToMono(UserResponse.class)
                                .doOnNext(user -> log.info("Đăng nhập thành công cho người dùng: {}", user.getPhone()))
                                .flatMap(user -> generateAuthTokens(user.getPhone()));
                    }
                    
                    if (response.statusCode().value() == 401) {
                        return Mono.error(new UserNotFoundException("Số điện thoại hoặc mật khẩu không đúng"));
                    }
                    
                    return response.bodyToMono(String.class)
                            .flatMap(error -> {
                                log.error("Phản hồi lỗi đăng nhập: {}", error);
                                return Mono.error(new RuntimeException("Lỗi khi đăng nhập: " + error));
                            });
                })
                .onErrorResume(e -> {
                    log.error("Lỗi đăng nhập: {}", e.getMessage());
                    if (e instanceof UserNotFoundException) {
                        return Mono.error(e);
                    }
                    return Mono.error(new RuntimeException("Lỗi trong quá trình đăng nhập: " + e.getMessage()));
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
                .map(refreshToken -> {
                    AuthResponse authResponse = new AuthResponse();
                    authResponse.setPhoneNumber(phoneNumber);
                    authResponse.setAccessToken(token);
                    authResponse.setRefreshToken(refreshToken.getToken());
                    return authResponse;
                });
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