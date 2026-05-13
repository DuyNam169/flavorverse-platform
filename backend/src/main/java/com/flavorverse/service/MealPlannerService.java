package com.flavorverse.service;

import com.flavorverse.dto.PlannerDtos;
import com.flavorverse.entity.*;
import com.flavorverse.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MealPlannerService {

    private final MealPlanRepository planRepo;
    private final MealSlotRepository slotRepo;
    private final RecipeRepository recipeRepo;
    private final UserService userService;
    private final RecipeService recipeService;

    public PlannerDtos.MealPlanResponse getWeek(UUID userId, LocalDate weekStart) {
        MealPlan plan = planRepo.findByUserIdAndWeekStart(userId, weekStart)
                .orElseGet(() -> createEmptyPlan(userId, weekStart));
        return toResponse(plan);
    }

    @Transactional
    public PlannerDtos.MealSlotResponse addMeal(UUID userId, PlannerDtos.AddMealRequest req, LocalDate weekStart) {
        MealPlan plan = planRepo.findByUserIdAndWeekStart(userId, weekStart)
                .orElseGet(() -> createEmptyPlan(userId, weekStart));

        Recipe recipe = recipeRepo.findById(req.getRecipeId())
                .orElseThrow(() -> new RuntimeException("Recipe not found"));

        // Remove existing slot for same day+meal
        slotRepo.deleteByPlanDayMeal(plan.getId(), req.getDayOfWeek(), req.getMealType());

        MealSlot slot = slotRepo.save(MealSlot.builder()
                .mealPlan(plan).recipe(recipe)
                .dayOfWeek(req.getDayOfWeek())
                .mealType(req.getMealType())
                .customLabel(req.getCustomLabel())
                .servings(req.getServings() != null ? req.getServings() : 1)
                .build());

        return toSlotResponse(slot);
    }

    @Transactional
    public void removeMeal(UUID slotId, UUID userId) {
        MealSlot slot = slotRepo.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));
        if (!slot.getMealPlan().getUser().getId().equals(userId))
            throw new RuntimeException("Not authorized");
        slotRepo.delete(slot);
    }

    public List<PlannerDtos.ShoppingItem> getShoppingList(UUID planId, UUID userId) {
        MealPlan plan = planRepo.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        if (!plan.getUser().getId().equals(userId))
            throw new RuntimeException("Not authorized");

        Map<String, PlannerDtos.ShoppingItem> aggregated = new LinkedHashMap<>();

        for (MealSlot slot : plan.getSlots()) {
            Recipe recipe = slot.getRecipe();
            if (recipe.getIngredients() == null) continue;
            for (Ingredient ing : recipe.getIngredients()) {
                String key = ing.getName().toLowerCase() + "_" + ing.getUnit();
                aggregated.merge(key,
                    PlannerDtos.ShoppingItem.builder()
                        .name(ing.getName()).amount(ing.getAmount()).unit(ing.getUnit())
                        .category(guessCategory(ing.getName()))
                        .fromRecipes(new ArrayList<>(List.of(recipe.getTitle())))
                        .build(),
                    (existing, incoming) -> {
                        if (existing.getAmount() != null && incoming.getAmount() != null)
                            existing.setAmount(existing.getAmount().add(incoming.getAmount()));
                        existing.getFromRecipes().add(recipe.getTitle());
                        return existing;
                    });
            }
        }

        return new ArrayList<>(aggregated.values());
    }

    private MealPlan createEmptyPlan(UUID userId, LocalDate weekStart) {
        User user = userService.getById(userId);
        return planRepo.save(MealPlan.builder()
                .user(user).weekStart(weekStart)
                .name("Thực đơn tuần " + weekStart).build());
    }

    private PlannerDtos.MealPlanResponse toResponse(MealPlan plan) {
        List<MealSlot> slots = slotRepo.findByMealPlanId(plan.getId());

        int totalCalories = slots.stream()
                .mapToInt(s -> s.getRecipe().getCaloriesPerServing() != null ?
                        s.getRecipe().getCaloriesPerServing() * s.getServings() : 0)
                .sum();

        return PlannerDtos.MealPlanResponse.builder()
                .id(plan.getId())
                .weekStart(plan.getWeekStart().toString())
                .slots(slots.stream().map(this::toSlotResponse).toList())
                .nutritionSummary(PlannerDtos.NutritionSummary.builder()
                        .totalCalories(totalCalories)
                        .avgDailyCalories(totalCalories / 7.0)
                        .totalProtein(sumNutrient(slots, "protein"))
                        .totalCarbs(sumNutrient(slots, "carbs"))
                        .totalFat(sumNutrient(slots, "fat"))
                        .build())
                .build();
    }

    private PlannerDtos.MealSlotResponse toSlotResponse(MealSlot slot) {
        return PlannerDtos.MealSlotResponse.builder()
                .id(slot.getId())
                .dayOfWeek(slot.getDayOfWeek())
                .mealType(slot.getMealType())
                .recipe(recipeService.toSummary(slot.getRecipe()))
                .servings(slot.getServings())
                .notes(slot.getNotes())
                .build();
    }

    private BigDecimal sumNutrient(List<MealSlot> slots, String type) {
        return slots.stream().map(s -> {
            BigDecimal val = switch (type) {
                case "protein" -> s.getRecipe().getProteinG();
                case "carbs" -> s.getRecipe().getCarbsG();
                case "fat" -> s.getRecipe().getFatG();
                default -> BigDecimal.ZERO;
            };
            return val != null ? val.multiply(BigDecimal.valueOf(s.getServings())) : BigDecimal.ZERO;
        }).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String guessCategory(String name) {
        String n = name.toLowerCase();
        if (n.matches(".*(thịt|gà|heo|bò|tôm|cá|mực|cua|lợn).*")) return "🥩 Thịt & Hải sản";
        if (n.matches(".*(rau|cải|giá|hành|gừng|cà|cà chua|tỏi).*")) return "🥬 Rau củ";
        if (n.matches(".*(gạo|bún|bánh phở|mì|bột|bánh mì).*")) return "🌾 Tinh bột";
        if (n.matches(".*(mắm|muối|đường|tiêu|ớt|quế|hồi|dầu|tương).*")) return "🧂 Gia vị";
        if (n.matches(".*(trứng|sữa|phô mai|bơ).*")) return "🥚 Trứng & Sữa";
        return "🛒 Khác";
    }
}
