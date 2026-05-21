package com.flavorverse.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtp(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("FlavorVerse - Mã xác nhận đặt lại mật khẩu");
        message.setText("""
                Xin chào,
                
                Mã OTP đặt lại mật khẩu của bạn là:
                
                %s
                
                Mã có hiệu lực trong 15 phút. Vui lòng không chia sẻ mã này với ai.
                
                Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
                
                — FlavorVerse Team
                """.formatted(otp));
        mailSender.send(message);
    }
}