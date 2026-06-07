package com.flavorverse.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class IngredientDtos {

    // ── Request ───────────────────────────────────────────────

    @Data
    public static class CreateIngredientRequest {
        @NotBlank(message = "Tên nguyên liệu không được để trống")
        @Size(max = 200)
        private String name;

        @Size(max = 200)
        private String nameVi;

        private String imageUrl;
        private String description;

        /** Danh sách tagId (phân loại, allergen, ...) */
        private List<UUID> tagIds;
    }

    @Data
    public static class AddAllergyRequest {
        @NotNull
        private UUID ingredientId;

        /** mild | moderate | severe */
        private String severity = "moderate";
        private String note;
    }

    // ── Response ──────────────────────────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IngredientResponse {
        private UUID id;
        private String name;
        private String nameVi;
        private String imageUrl;
        private String description;
        private Integer useCount;
        private List<TagDto> tags;
        private UUID createdById;
        private String createdByUsername;
        private LocalDateTime createdAt;
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
        private Integer useCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AllergyResponse {
        private UUID ingredientId;
        private String ingredientName;
        private String ingredientImageUrl;
        private String severity;
        private String note;
    }
}