package com.example.authservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.example.authservice.service.EmailService;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendPasswordResetEmail(String to, String subject, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText("Để đặt lại mật khẩu, vui lòng truy cập đường dẫn sau: " +
                "http://yourapp.com/reset-password?token=" + token + "\n\n" +
                "Đường dẫn có hiệu lực trong 24 giờ.\n\n" +
                "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\n" +
                "Trân trọng,\nĐội ngũ hỗ trợ");
        
        mailSender.send(message);
    }
}
