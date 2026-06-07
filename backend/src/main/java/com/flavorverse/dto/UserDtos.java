package com.flavorverse.dto;

import com.flavorverse.dto.IngredientDtos;
import lombok.*;
import jakarta.validation.constraints.*;
import java.util.UUID;
import java.time.LocalDate;
import java.util.List;

public class UserDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummary {
        private UUID id;
        private String username;
        private String displayName;
        private String avatarUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TagDto {
        private UUID id;
        private String name;
        private String slug;
        private String type;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserResponse {
        private UUID id;
        private String username;
        private String displayName;
        private String email;
        private String avatarUrl;
        private String bio;
        private String location;
        private String countryCode;
        private LocalDate dateOfBirth;
        private Integer calorieGoal;
        private String dietType;
        private List<IngredientDtos.AllergyResponse> allergies;
        private Long followersCount;
        private Long followingCount;
        private Long recipeCount;
    }

    @Data
    public static class UpdateProfileRequest {
        private String displayName;
        @Size(max = 30) private String username;
        @Size(max = 200) private String bio;
        private String location;
        private String countryCode;
        private LocalDate dateOfBirth;
        @Min(1200) @Max(5000) private Integer calorieGoal;
        private String dietType;
        private String avatarUrl;
    }
}