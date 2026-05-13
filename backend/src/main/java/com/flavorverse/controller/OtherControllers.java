package com.flavorverse.controller;

import com.flavorverse.dto.*;
import com.flavorverse.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.UUID;

// ── UserController ────────────────────────────────────────────
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
class UserController {

    private final UserService userService;
    private final RecipeService recipeService;

    @GetMapping("/{id}/profile")
    public ResponseEntity<?> getProfile(@PathVariable UUID id) {
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok(userService.toDto(userService.getById(id))));
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
    public ResponseEntity<?> getSaved(@PathVariable UUID id, Principal principal) {
        // For now return saved IDs — frontend can resolve
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok(recipeService.getSavedIds(id)));
    }
}

// ── PlannerController ─────────────────────────────────────────
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
    public ResponseEntity<?> addMeal(@Valid @RequestBody PlannerDtos.AddMealRequest req,
                                      @RequestParam(required = false)
                                      @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart,
                                      Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        LocalDate week = weekStart != null ? weekStart : LocalDate.now().with(
                java.time.DayOfWeek.MONDAY);
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

// ── UploadController ──────────────────────────────────────────
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
class UploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/avatar")
    public ResponseEntity<?> avatar(@RequestParam("file") org.springframework.web.multipart.MultipartFile file,
                                     Principal principal) {
        try {
            String url = cloudinaryService.uploadImage(file, "avatars");
            return ResponseEntity.ok(CommonDtos.ApiResponse.ok(java.util.Map.of("url", url)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(CommonDtos.ApiResponse.error(e.getMessage()));
        }
    }
}
