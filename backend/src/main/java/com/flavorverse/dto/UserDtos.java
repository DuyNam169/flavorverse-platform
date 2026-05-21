package com.flavorverse.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.util.UUID;
import java.time.LocalDate;
import java.util.List;

public class UserDtos {

    @Data @Builder
    public static class TagDto {
        private UUID id;
        private String name;
        private String slug;
        private String type;
    }

    @Data @Builder
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
        private List<TagDto> allergyTags;
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
        private List<String> allergyTagNames;
        private String avatarUrl;
    }
}