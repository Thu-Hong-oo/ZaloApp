package com.zalo.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

import com.twilio.Twilio;
import com.zalo.auth.config.TwilioConfig;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class ZaloAppAuthService {
@Autowired
	private TwilioConfig twilioConfig;

@PostConstruct
public void initTwilio() {
	Twilio.init(twilioConfig.getAccountSid(), twilioConfig.getAuthToken());
}
	public static void main(String[] args) {
		SpringApplication.run(ZaloAppAuthService.class, args);
	}

}
