package com.flavorverse.dto;

import lombok.*;
import jakarta.validation.constraints.*;

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
}