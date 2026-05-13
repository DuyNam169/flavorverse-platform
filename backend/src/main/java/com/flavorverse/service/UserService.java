package com.flavorverse.service;

import com.flavorverse.dto.UserDtos;
import com.flavorverse.entity.User;
import com.flavorverse.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;
    private final RecipeRepository recipeRepo;

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
        if (req.getAllergies() != null) user.setAllergies(req.getAllergies());
        return userRepo.save(user);
    }

    public UserDtos.UserResponse toDto(User user) {
        long recipeCount = recipeRepo.findByAuthorIdOrderByCreatedAtDesc(user.getId()).size();
        return UserDtos.UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .location(user.getLocation())
                .countryCode(user.getCountryCode())
                .calorieGoal(user.getCalorieGoal())
                .dietType(user.getDietType())
                .allergies(user.getAllergies())
                .followersCount(0L)
                .followingCount(0L)
                .recipeCount(recipeCount)
                .build();
    }
}
