package com.flavorverse.service;

import com.flavorverse.dto.UserDtos;
import com.flavorverse.entity.User;
import com.flavorverse.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.flavorverse.entity.Tag;
import java.util.List;
import java.util.stream.Collectors;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;
    private final RecipeRepository recipeRepo;
    private final PasswordEncoder passwordEncoder;
    private final TagService tagService;

    public User getById(UUID id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    public User getByGoogleId(String googleId) {
        return userRepo.findByGoogleId(googleId).orElse(null);
    }

    @Transactional
    public User createOrUpdateFromGoogle(String googleId, String email,
                                         String displayName, String avatarUrl) {
        return userRepo.findByGoogleId(googleId).map(u -> {
            u.setAvatarUrl(avatarUrl);
            u.setDisplayName(displayName);
            return userRepo.save(u);
        }).orElseGet(() -> {
            String base = email.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "");
            String username = base;
            int suffix = 1;
            while (userRepo.existsByUsername(username)) {
                username = base + suffix++;
            }
            return userRepo.save(User.builder()
                    .googleId(googleId)
                    .email(email)
                    .username(username)
                    .displayName(displayName)
                    .avatarUrl(avatarUrl)
                    .build());
        });
    }

    @Transactional
    public User updateProfile(UUID userId, UserDtos.UpdateProfileRequest req) {
        User user = getById(userId);
        if (req.getDisplayName() != null) user.setDisplayName(req.getDisplayName());
        if (req.getUsername() != null) {
            if (userRepo.existsByUsername(req.getUsername()) && !req.getUsername().equals(user.getUsername()))
                throw new RuntimeException("Username already taken");
            user.setUsername(req.getUsername());
        }
        if (req.getBio() != null) user.setBio(req.getBio());
        if (req.getLocation() != null) user.setLocation(req.getLocation());
        if (req.getCountryCode() != null) user.setCountryCode(req.getCountryCode());
        if (req.getCalorieGoal() != null) user.setCalorieGoal(req.getCalorieGoal());
        if (req.getDietType() != null) user.setDietType(req.getDietType());
        if (req.getAllergyTagNames() != null) {
            List<Tag> tags = req.getAllergyTagNames().stream()
                    .map(name -> tagService.findOrCreate(name, "allergy"))
                    .collect(Collectors.toList());
            user.setAllergyTags(tags);
        }
        if (req.getDateOfBirth() != null) user.setDateOfBirth(req.getDateOfBirth());
        if (req.getAvatarUrl() != null) user.setAvatarUrl(req.getAvatarUrl());
        return userRepo.save(user);
    }

    public UserDtos.UserResponse toDto(User user) {
        long recipeCount = recipeRepo.findByAuthorIdOrderByCreatedAtDesc(user.getId()).size();
        return UserDtos.UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .location(user.getLocation())
                .countryCode(user.getCountryCode())
                .dateOfBirth(user.getDateOfBirth())
                .calorieGoal(user.getCalorieGoal())
                .dietType(user.getDietType())
                .allergyTags(user.getAllergyTags() == null ? List.of() :
                    user.getAllergyTags().stream()
                        .map(t -> UserDtos.TagDto.builder()
                            .id(t.getId()).name(t.getName())
                            .slug(t.getSlug()).type(t.getType())
                            .build())
                        .collect(Collectors.toList()))
                .followersCount(0L)
                .followingCount(0L)
                .recipeCount(recipeCount)
                .build();
    }

    @Transactional
    public User register(String email, String password, String username) {
        if (userRepo.existsByEmail(email))
            throw new RuntimeException("Email đã được sử dụng");
        if (userRepo.existsByUsername(username))
            throw new RuntimeException("Username đã được sử dụng");

        return userRepo.save(User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .username(username)
                .displayName(username)
                .build());
    }

    public User loginWithEmail(String email, String password) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));
        if (user.getPasswordHash() == null)
            throw new RuntimeException("Tài khoản này dùng đăng nhập Google, không có mật khẩu");
        if (!passwordEncoder.matches(password, user.getPasswordHash()))
            throw new RuntimeException("Mật khẩu không đúng");
        return user;
    }

    public void updatePassword(String email, String newPassword) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepo.save(user);
    }
}
