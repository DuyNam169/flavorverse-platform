package com.flavorverse.controller;

import com.flavorverse.dto.CommonDtos;
import com.flavorverse.dto.IngredientDtos;
import com.flavorverse.dto.PlannerDtos;
import com.flavorverse.dto.UserDtos;
import com.flavorverse.service.CloudinaryService;
import com.flavorverse.service.MealPlannerService;
import com.flavorverse.service.RecipeService;
import com.flavorverse.service.TagService;
import com.flavorverse.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

// ── UserController ─────────────────────────────────────────────
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
class UserController {

    private final UserService userService;
    private final RecipeService recipeService;

    @GetMapping("/{id}/profile")
    public ResponseEntity<?> getProfile(@PathVariable UUID id) {
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok(
                userService.toDto(userService.getById(id))));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@Valid @RequestBody UserDtos.UpdateProfileRequest req,
                                       Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok(
                userService.toDto(userService.updateProfile(userId, req))));
    }

    @GetMapping("/me/saved-ids")
    public ResponseEntity<?> savedIds(Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok(recipeService.getSavedIds(userId)));
    }

    @GetMapping("/{id}/recipes")
    public ResponseEntity<?> getUserRecipes(@PathVariable UUID id) {
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok(recipeService.getByAuthor(id)));
    }

    @GetMapping("/{id}/saved")
    public ResponseEntity<?> getSaved(@PathVariable UUID id) {
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok(
                recipeService.getSavedRecipes(id)));
    }
}

// ── AllergyController (dị ứng với ingredient) ─────────────────
@RestController
@RequestMapping("/api/users/me/allergies")
@RequiredArgsConstructor
class AllergyController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<?> list(Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok(userService.getAllergies(userId)));
    }

    @PostMapping
    public ResponseEntity<?> add(@Valid @RequestBody IngredientDtos.AddAllergyRequest req,
                                  Principal principal) {
        try {
            UUID userId = UUID.fromString(principal.getName());
            return ResponseEntity.ok(CommonDtos.ApiResponse.ok(
                    "Đã thêm dị ứng", userService.addAllergy(userId, req)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(CommonDtos.ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{ingredientId}")
    public ResponseEntity<?> remove(@PathVariable UUID ingredientId, Principal principal) {
        try {
            UUID userId = UUID.fromString(principal.getName());
            userService.removeAllergy(userId, ingredientId);
            return ResponseEntity.ok(CommonDtos.ApiResponse.ok("Đã xóa dị ứng", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(CommonDtos.ApiResponse.error(e.getMessage()));
        }
    }
}

// ── PlannerController ──────────────────────────────────────────
@RestController
@RequestMapping("/api/planner")
@RequiredArgsConstructor
class PlannerController {

    private final MealPlannerService plannerService;

    @GetMapping
    public ResponseEntity<?> getWeek(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart,
            Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok(
                plannerService.getWeek(userId, weekStart)));
    }

    @PostMapping("/meals")
    public ResponseEntity<?> addMeal(
            @Valid @RequestBody PlannerDtos.AddMealRequest req,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart,
            Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        LocalDate week = weekStart != null ? weekStart :
                LocalDate.now().with(DayOfWeek.MONDAY);
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok(
                plannerService.addMeal(userId, req, week)));
    }

    @DeleteMapping("/meals/{slotId}")
    public ResponseEntity<?> removeMeal(@PathVariable UUID slotId, Principal principal) {
        plannerService.removeMeal(slotId, UUID.fromString(principal.getName()));
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok("Đã xóa", null));
    }

    @GetMapping("/{planId}/shopping-list")
    public ResponseEntity<?> shoppingList(@PathVariable UUID planId, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok(
                plannerService.getShoppingList(planId, userId)));
    }
}

// ── UploadController ───────────────────────────────────────────
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
class UploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/avatar")
    public ResponseEntity<?> avatar(@RequestParam("file") MultipartFile file,
                                     Principal principal) {
        try {
            String url = cloudinaryService.uploadImage(file, "avatars");
            return ResponseEntity.ok(CommonDtos.ApiResponse.ok(Map.of("url", url)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(CommonDtos.ApiResponse.error(e.getMessage()));
        }
    }
}