package com.example.authservice.controller;


import com.example.authservice.dto.request.ForgotPasswordRequest;
import com.example.authservice.dto.request.LoginRequest;
import com.example.authservice.dto.request.RegisterRequest;
import com.example.authservice.dto.request.ResetPasswordRequest;
import com.example.authservice.dto.response.AuthResponse;
import com.example.authservice.dto.response.MessageResponse;
import com.example.authservice.security.JwtTokenProvider;
import com.example.authservice.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {


    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getPhoneNumber(),
                            loginRequest.getPassword()
                    )
            );

            String jwt = tokenProvider.generateToken(authentication);
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            return ResponseEntity.ok(new AuthResponse(jwt, userDetails.getUsername()));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Đăng nhập thất bại: " + e.getMessage());
        }
    }
    @PostMapping("/register")
    public ResponseEntity<MessageResponse> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        MessageResponse response = authService.registerUser(registerRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        MessageResponse response = authService.processForgotPassword(forgotPasswordRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        MessageResponse response = authService.resetPassword(resetPasswordRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<MessageResponse> validateResetToken(@RequestParam("token") String token) {
        boolean isValid = authService.validatePasswordResetToken(token);
        MessageResponse response = new MessageResponse(
                isValid ? "Token hợp lệ" : "Token không hợp lệ hoặc đã hết hạn",
                isValid
        );
        return ResponseEntity.ok(response);
    }
}