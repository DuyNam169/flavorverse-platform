package com.flavorverse.controller;

import com.flavorverse.dto.CommonDtos;
import com.flavorverse.dto.IngredientDtos;
import com.flavorverse.entity.User;
import com.flavorverse.service.IngredientService;
import com.flavorverse.service.TagService;
import com.flavorverse.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/ingredients")
@RequiredArgsConstructor
public class IngredientController {

    private final IngredientService ingredientService;
    private final TagService tagService;
    private final UserService userService;

    // ── Public ────────────────────────────────────────────────

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String q) {
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok(ingredientService.search(q)));
    }

    @GetMapping("/popular")
    public ResponseEntity<?> popular() {
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok(ingredientService.getPopular()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(CommonDtos.ApiResponse.ok(ingredientService.getById(id)));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ── Protected ─────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody IngredientDtos.CreateIngredientRequest req,
                                     Principal principal) {
        try {
            User creator = userService.getById(UUID.fromString(principal.getName()));
            return ResponseEntity.ok(CommonDtos.ApiResponse.ok(
                    "Tạo nguyên liệu thành công",
                    ingredientService.create(req, creator)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(CommonDtos.ApiResponse.error(e.getMessage()));
        }
    }
}