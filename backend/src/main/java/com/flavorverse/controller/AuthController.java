package com.flavorverse.controller;

import com.flavorverse.dto.AuthDtos;
import com.flavorverse.dto.CommonDtos;
import com.flavorverse.entity.User;
import com.flavorverse.security.JwtUtil;
import com.flavorverse.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;

    private final WebClient webClient = WebClient.create();

    /**
     * Frontend redirects user to Google → Google returns code → frontend POSTs code here
     */
    @PostMapping("/google/callback")
    public ResponseEntity<?> googleCallback(@RequestBody AuthDtos.GoogleCallbackRequest req) {
        try {
            // Exchange code for Google access token
            Map<?, ?> tokenResponse = webClient.post()
                    .uri("https://oauth2.googleapis.com/token")
                    .bodyValue(Map.of(
                            "code", req.getCode(),
                            "client_id", googleClientId,
                            "client_secret", googleClientSecret,
                            "redirect_uri", "postmessage",
                            "grant_type", "authorization_code"))
                    .retrieve().bodyToMono(Map.class).block();

            String googleAccessToken = (String) tokenResponse.get("access_token");

            // Get user info from Google
            Map<?, ?> googleUser = webClient.get()
                    .uri("https://www.googleapis.com/oauth2/v3/userinfo")
                    .header("Authorization", "Bearer " + googleAccessToken)
                    .retrieve().bodyToMono(Map.class).block();

            String googleId = (String) googleUser.get("sub");
            String email = (String) googleUser.get("email");
            String name = (String) googleUser.get("name");
            String picture = (String) googleUser.get("picture");

            User user = userService.createOrUpdateFromGoogle(googleId, email, name, picture);

            String accessToken = jwtUtil.generateToken(user.getId(), user.getEmail());
            String refreshToken = jwtUtil.generateRefreshToken(user.getId());

            return ResponseEntity.ok(CommonDtos.ApiResponse.ok(
                    AuthDtos.AuthResponse.builder()
                            .accessToken(accessToken)
                            .refreshToken(refreshToken)
                            .user(userService.toDto(user))
                            .build()));
        } catch (Exception e) {
            log.error("Google auth failed", e);
            return ResponseEntity.badRequest()
                    .body(CommonDtos.ApiResponse.error("Đăng nhập thất bại: " + e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody AuthDtos.RefreshRequest req) {
        try {
            if (!jwtUtil.isValid(req.getRefreshToken()))
                return ResponseEntity.badRequest().body(CommonDtos.ApiResponse.error("Invalid refresh token"));

            var claims = jwtUtil.parseToken(req.getRefreshToken());
            if (!"refresh".equals(claims.get("type")))
                return ResponseEntity.badRequest().body(CommonDtos.ApiResponse.error("Not a refresh token"));

            var userId = jwtUtil.extractUserId(req.getRefreshToken());
            User user = userService.getById(userId);
            String newToken = jwtUtil.generateToken(user.getId(), user.getEmail());

            return ResponseEntity.ok(CommonDtos.ApiResponse.ok(Map.of("accessToken", newToken)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(CommonDtos.ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(java.security.Principal principal) {
        if (principal == null)
            return ResponseEntity.status(401).body(CommonDtos.ApiResponse.error("Unauthorized"));
        try {
            var userId = java.util.UUID.fromString(principal.getName());
            User user = userService.getById(userId);
            return ResponseEntity.ok(CommonDtos.ApiResponse.ok(userService.toDto(user)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(CommonDtos.ApiResponse.error(e.getMessage()));
        }
    }
}
