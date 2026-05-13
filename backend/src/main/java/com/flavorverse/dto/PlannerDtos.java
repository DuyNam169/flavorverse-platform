package com.flavorverse.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class PlannerDtos {

    @Data public static class AddMealRequest {
        @NotNull private UUID recipeId;
        @NotNull @Min(0) @Max(6) private Integer dayOfWeek;
        @NotBlank private String mealType;
        private String customLabel;
        private Integer servings;
    }

    @Data @Builder public static class MealPlanResponse {
        private UUID id;
        private String weekStart;
        private List<MealSlotResponse> slots;
        private NutritionSummary nutritionSummary;
    }

    @Data @Builder public static class MealSlotResponse {
        private UUID id;
        private Integer dayOfWeek;
        private String mealType;
        private RecipeDtos.RecipeSummary recipe;
        private Integer servings;
        private String notes;
    }

    @Data @Builder public static class NutritionSummary {
        private Integer totalCalories;
        private Double avgDailyCalories;
        private BigDecimal totalProtein;
        private BigDecimal totalCarbs;
        private BigDecimal totalFat;
    }

    @Data @Builder public static class ShoppingItem {
        private String name;
        private BigDecimal amount;
        private String unit;
        private String category;
        private List<String> fromRecipes;
    }
}