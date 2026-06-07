package com.flavorverse.controller;

import com.flavorverse.dto.CommonDtos;
import com.flavorverse.dto.RecipeDtos;
import com.flavorverse.dto.ReviewDtos;
import com.flavorverse.service.CloudinaryService;
import com.flavorverse.service.RecipeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;
    private final CloudinaryService cloudinaryService;

    // ── Public ────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<?> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok(recipeService.getFeed(page, size)));
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok(recipeService.search(q, page, size)));
    }

    @GetMapping("/discover")
    public ResponseEntity<?> discover(
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String difficulty,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok(
                recipeService.discover(country, difficulty, page, size)));
    }

    @GetMapping("/trending")
    public ResponseEntity<?> trending(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok(recipeService.getTrending(limit)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(CommonDtos.ApiResponse.ok(recipeService.getById(id)));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ── Protected ─────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody RecipeDtos.CreateRecipeRequest req,
                                     Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok("Tạo công thức thành công",
                recipeService.create(userId, req)));
    }

    @PostMapping("/{id}/fork")
    public ResponseEntity<?> fork(@PathVariable UUID id, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok("Fork thành công",
                recipeService.fork(id, userId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id, Principal principal) {
        recipeService.delete(id, UUID.fromString(principal.getName()));
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok("Đã xóa", null));
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<?> save(@PathVariable UUID id, Principal principal) {
        recipeService.save(id, UUID.fromString(principal.getName()));
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok("Đã lưu", null));
    }

    @DeleteMapping("/{id}/save")
    public ResponseEntity<?> unsave(@PathVariable UUID id, Principal principal) {
        recipeService.unsave(id, UUID.fromString(principal.getName()));
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok("Đã bỏ lưu", null));
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<?> addReview(@PathVariable UUID id,
                                        @Valid @RequestBody ReviewDtos.CreateReviewRequest req,
                                        Principal principal) {
        recipeService.addReview(id, UUID.fromString(principal.getName()),
                req.getRating(), req.getComment());
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok("Đánh giá thành công", null));
    }

    // ── Upload ────────────────────────────────────────────────

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file,
                                          Principal principal) {
        try {
            String url = cloudinaryService.uploadImage(file, "recipes");
            return ResponseEntity.ok(CommonDtos.ApiResponse.ok(Map.of("url", url)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(CommonDtos.ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/upload-video")
    public ResponseEntity<?> uploadVideo(@RequestParam("file") MultipartFile file,
                                          Principal principal) {
        try {
            String url = cloudinaryService.uploadVideo(file, "recipes");
            return ResponseEntity.ok(CommonDtos.ApiResponse.ok(Map.of("url", url)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(CommonDtos.ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id,
                                    @Valid @RequestBody RecipeDtos.CreateRecipeRequest req,
                                    Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok("Cập nhật thành công",
                recipeService.update(id, userId, req)));
    }
}