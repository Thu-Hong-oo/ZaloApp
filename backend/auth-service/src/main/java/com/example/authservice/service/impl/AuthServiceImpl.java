package com.example.authservice.service.impl;

import com.example.authservice.dto.request.ForgotPasswordRequest;
import com.example.authservice.dto.request.LoginRequest;
import com.example.authservice.dto.request.RegisterRequest;
import com.example.authservice.dto.request.ResetPasswordRequest;
import com.example.authservice.dto.response.AuthResponse;
import com.example.authservice.dto.response.MessageResponse;
import com.example.authservice.entity.PasswordResetToken;
import com.example.authservice.entity.User;
import com.example.authservice.repository.PasswordResetTokenRepository;
import com.example.authservice.repository.UserRepository;
import com.example.authservice.security.JwtTokenProvider;
import com.example.authservice.service.AuthService;
import com.example.authservice.service.EmailService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Calendar;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;

    @Override
    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getPhoneNumber(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateToken(authentication);
        
        User user = userRepository.findByPhoneNumber(loginRequest.getPhoneNumber())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        return new AuthResponse(jwt, user.getId(), user.getUsername());
    }

    @Override
    public MessageResponse registerUser(RegisterRequest registerRequest) {
        // if (userRepository.existsByUsername(registerRequest.getUsername())) {
        //     return new MessageResponse("Username đã tồn tại", false);
        // }

        if (userRepository.existsByPhoneNumber(registerRequest.getPhoneNumber())) {
            return new MessageResponse("Số điện thoại đã được sử dụng", false);
        }

        // Create new user account
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setPhoneNumber(registerRequest.getPhoneNumber());
        user.setEnabled(true);

        userRepository.save(user);

        return new MessageResponse("Đăng ký thành công!", true);
    }

    @Override
    public MessageResponse processForgotPassword(ForgotPasswordRequest forgotPasswordRequest) {
        Optional<User> userOptional = userRepository.findByPhoneNumber(forgotPasswordRequest.getPhoneNumber());
        if (userOptional.isEmpty()) {
            return new MessageResponse("Số điện thoại không tồn tại trong hệ thống", false);
        }
    
        User user = userOptional.get();
        String token = UUID.randomUUID().toString();
        createPasswordResetTokenForUser(user, token);
    
        // TODO: Tích hợp gửi mã qua SMS ở đây
    
        return new MessageResponse("Vui lòng kiểm tra tin nhắn để lấy mã đặt lại mật khẩu", true);
    }
    
    @Override
    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest resetPasswordRequest) {
        String token = resetPasswordRequest.getToken();
        
        if (!validatePasswordResetToken(token)) {
            return new MessageResponse("Token không hợp lệ hoặc đã hết hạn", false);
        }

        if (!resetPasswordRequest.getPassword().equals(resetPasswordRequest.getConfirmPassword())) {
            return new MessageResponse("Mật khẩu xác nhận không khớp", false);
        }

        Optional<PasswordResetToken> passwordResetTokenOptional = passwordResetTokenRepository.findByToken(token);
        if (passwordResetTokenOptional.isEmpty()) {
            return new MessageResponse("Token không tồn tại", false);
        }

        User user = passwordResetTokenOptional.get().getUser();
        user.setPassword(passwordEncoder.encode(resetPasswordRequest.getPassword()));
        userRepository.save(user);

        passwordResetTokenRepository.delete(passwordResetTokenOptional.get());

        return new MessageResponse("Đặt lại mật khẩu thành công", true);
    }

    @Override
    public boolean validatePasswordResetToken(String token) {
        final PasswordResetToken passToken = passwordResetTokenRepository.findByToken(token).orElse(null);
        
        if (passToken == null) {
            return false;
        }
        
        return !passToken.isExpired();
    }

    private void createPasswordResetTokenForUser(User user, String token) {
        // Xóa token cũ nếu có
        passwordResetTokenRepository.findByUser(user).ifPresent(passwordResetTokenRepository::delete);
        
        // Tạo token mới
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        cal.add(Calendar.HOUR, 24); // Token hết hạn sau 24 giờ
        
        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setUser(user);
        passwordResetToken.setToken(token);
        passwordResetToken.setExpiryDate(cal.getTime());
        
        passwordResetTokenRepository.save(passwordResetToken);
    }
}

