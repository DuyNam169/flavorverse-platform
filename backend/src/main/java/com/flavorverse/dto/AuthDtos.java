package com.flavorverse.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

public class AuthDtos {

    @Data public static class GoogleCallbackRequest {
        @NotBlank private String code;
    }

    @Data @Builder public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private UserDtos.UserResponse user;
    }

    @Data public static class RefreshRequest {
        @NotBlank private String refreshToken;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Email không được để trống")
        @Email(regexp = "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$",
            message = "Email không hợp lệ")
        private String email;

        @NotBlank(message = "Mật khẩu không được để trống")
        @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d).{8,}$",
                message = "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa và 1 số")
        private String password;

        @NotBlank(message = "Username không được để trống")
        @Size(min = 3, max = 30, message = "Username phải từ 3-30 ký tự")
        @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username chỉ gồm chữ, số và dấu _")
        private String username;
    }

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Email không được để trống")
        @Email(regexp = "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$",
        message = "Email không hợp lệ")
        private String email;

        @NotBlank(message = "Mật khẩu không được để trống")
        private String password;
    }

    @Data
    public static class ForgotPasswordRequest {
        @NotBlank @Email(regexp = "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$",
                        message = "Email không hợp lệ")
        private String email;
    }

    @Data
    public static class VerifyOtpRequest {
        @NotBlank private String email;
        @NotBlank private String otp;
    }

    @Data
    public static class ResetPasswordRequest {
        @NotBlank private String email;
        @NotBlank private String otp;
        @NotBlank
        @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d).{8,}$",
                message = "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa và 1 số")
        private String newPassword;
    }

    @Data
    public static class ChangePasswordRequest {
        @NotBlank private String currentPassword;
        @NotBlank
        @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d).{8,}$",
                message = "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa và 1 số")
        private String newPassword;
    }
}