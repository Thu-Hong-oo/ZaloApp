package com.zalo.auth.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class OtpData {
    private String phoneNumber;
    private String otp;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean used;
    private int attempts;

    public OtpData(String phoneNumber, String otp, LocalDateTime createdAt, LocalDateTime expiresAt) {
        this.phoneNumber = phoneNumber;
        this.otp = otp;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.used = false;
        this.attempts = 0;
    }

    @JsonIgnore
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public void incrementAttempts() {
        this.attempts++;
    }

    @JsonIgnore
    public boolean hasExceededMaxAttempts() {
        return attempts >= 3;
    }
}
