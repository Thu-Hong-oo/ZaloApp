package com.example.authservice.service;

public interface EmailService {
    void sendPasswordResetEmail(String to, String subject, String token);
}
