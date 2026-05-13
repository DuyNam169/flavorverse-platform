package com.flavorverse.dto;

import lombok.*;
import lombok.experimental.SuperBuilder;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class RecipeDtos {

    @Data public static class IngredientRequest {
        @NotBlank private String name;
        private BigDecimal amount;
        private String unit;
        private String note;
        private Integer orderIndex;
        private Boolean optional;
    }

    @Data public static class StepRequest {
        @NotNull private Integer stepNumber;
        private String title;
        @NotBlank private String description;
        private Integer timerSeconds;
    }

    @Data public static class CreateRecipeRequest {
        @NotBlank @Size(max = 200) private String title;
        private String description;
        private String thumbnailUrl;
        private String countryCode;
        @Min(0) private Integer prepTimeMinutes;
        @Min(0) private Integer cookTimeMinutes;
        @Min(1) private Integer servings;
        private String difficulty;
        private Boolean isPublic;
        // Nutrition
        private Integer caloriesPerServing;
        private BigDecimal proteinG;
        private BigDecimal carbsG;
        private BigDecimal fatG;
        private BigDecimal fiberG;
        private BigDecimal sugarG;
        // Lists
        private List<IngredientRequest> ingredients;
        private List<StepRequest> steps;
        private String[] tags;
        private String[] season;
    }

    @Data @SuperBuilder @NoArgsConstructor @AllArgsConstructor public static class RecipeSummary {
        private UUID id;
        private UserDtos.UserResponse author;
        private String title;
        private String description;
        private String thumbnailUrl;
        private String countryCode;
        private String difficulty;
        private Integer prepTimeMinutes;
        private Integer cookTimeMinutes;
        private Integer servings;
        private Integer caloriesPerServing;
        private BigDecimal proteinG;
        private BigDecimal carbsG;
        private BigDecimal fatG;
        private Integer forkCount;
        private Integer saveCount;
        private BigDecimal avgRating;
        private Integer ratingCount;
        private String[] tags;
        private String[] season;
        private Boolean isPublic;
        private UUID forkedFromId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data @SuperBuilder @NoArgsConstructor @AllArgsConstructor public static class RecipeDetail extends RecipeSummary {
        private List<IngredientResponse> ingredients;
        private List<StepResponse> steps;
    }

    @Data @SuperBuilder @NoArgsConstructor @AllArgsConstructor public static class IngredientResponse {
        private UUID id;
        private String name;
        private BigDecimal amount;
        private String unit;
        private String note;
        private Integer orderIndex;
        private Boolean isOptional;
    }

    @Data @SuperBuilder @NoArgsConstructor @AllArgsConstructor public static class StepResponse {
        private UUID id;
        private Integer stepNumber;
        private String title;
        private String description;
        private String imageUrl;
        private Integer timerSeconds;
    }
}