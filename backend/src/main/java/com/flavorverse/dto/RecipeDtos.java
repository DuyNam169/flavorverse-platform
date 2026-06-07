package com.flavorverse.dto;

import lombok.*;
import lombok.experimental.SuperBuilder;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class RecipeDtos {

    // ── Request ───────────────────────────────────────────────

    @Data
    public static class RecipeIngredientRequest {
        /**
         * ID của ingredient trong bảng ingredients (master).
         * Nếu null thì dùng customName.
         */
        private UUID ingredientId;

        /**
         * Tên tự nhập khi ingredient chưa có trong master.
         * Bắt buộc nếu ingredientId == null.
         */
        private String customName;

        private BigDecimal amount;
        private String unit;
        private String note;
        private Integer orderIndex;
        private Boolean optional;
    }

    @Data
    public static class StepRequest {
        @NotNull
        private Integer stepNumber;
        private String title;
        @NotBlank
        private String description;
        private Integer timer;
        private String imageUrl;
        private String videoUrl;
        private String[] mediaUrls;
    }

    @Data
    public static class CreateRecipeRequest {
        @NotBlank @Size(max = 200)
        private String title;

        private String description;
        private String thumbnailUrl;
        private String videoUrl;
        private String[] mediaUrls;
        private String countryCode;

        @Min(0) private Integer prepTimeMinutes;
        @Min(0) private Integer cookTimeMinutes;
        @Min(1) private Integer servings;

        /** easy | medium | hard */
        private String difficulty;

        /** public | followers_only | private */
        private String visibility;

        // Nutrition
        private Integer caloriesPerServing;
        private BigDecimal proteinG;
        private BigDecimal carbsG;
        private BigDecimal fatG;
        private BigDecimal fiberG;
        private BigDecimal sugarG;
        private Integer sodiumMg;
        private Integer cholesterolMg;

        private String[] season;
        private List<UUID> tagIds;
        private List<RecipeIngredientRequest> ingredients;
        private List<StepRequest> steps;
    }

    // ── Response ──────────────────────────────────────────────

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecipeSummary {
        private UUID id;
        private UserDtos.UserSummary author;
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
        private List<IngredientDtos.TagDto> tags;
        private String[] season;
        private String visibility;
        private UUID forkedFromId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @EqualsAndHashCode(callSuper = false)
    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecipeDetail extends RecipeSummary {
        private String videoUrl;
        private String[] mediaUrls;
        private BigDecimal fiberG;
        private BigDecimal sugarG;
        private Integer sodiumMg;
        private Integer cholesterolMg;
        private List<RecipeIngredientResponse> ingredients;
        private List<StepResponse> steps;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecipeIngredientResponse {
        private UUID id;
        /** ID của ingredient master (null nếu là custom) */
        private UUID ingredientId;
        /** Tên hiển thị (ingredient.name hoặc customName) */
        private String name;
        private String imageUrl;  // từ ingredient master
        private BigDecimal amount;
        private String unit;
        private String note;
        private Integer orderIndex;
        private Boolean isOptional;
        private List<IngredientDtos.TagDto> tags;  // tags của ingredient
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StepResponse {
        private UUID id;
        private Integer stepNumber;
        private String title;
        private String description;
        private String imageUrl;
        private String videoUrl;
        private String[] mediaUrls;
        private Integer timer;
    }
}