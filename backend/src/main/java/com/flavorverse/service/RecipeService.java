package com.flavorverse.service;

import com.flavorverse.dto.CommonDtos;
import com.flavorverse.dto.RecipeDtos;
import com.flavorverse.entity.*;
import com.flavorverse.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepo;
    private final RecipeIngredientRepository recipeIngredientRepo;
    private final ReviewRepository reviewRepo;
    private final SavedRecipeRepository savedRepo;
    private final TagRepository tagRepo;
    private final IngredientRepository ingredientRepo;
    private final UserService userService;
    private final IngredientService ingredientService;
    private final TagService tagService;

    // ── Queries ──────────────────────────────────────────────

    public CommonDtos.PageResponse<RecipeDtos.RecipeSummary> getFeed(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return toPage(recipeRepo.findPublicOrderByCreatedAtDesc(pageable).map(this::toSummary));
    }

    public CommonDtos.PageResponse<RecipeDtos.RecipeSummary> search(String q, int page, int size) {
        return toPage(recipeRepo.searchPublic(q, PageRequest.of(page, size)).map(this::toSummary));
    }

    public CommonDtos.PageResponse<RecipeDtos.RecipeSummary> discover(
            String country, String difficulty, int page, int size) {
        return toPage(recipeRepo.discover(country, difficulty, PageRequest.of(page, size))
                .map(this::toSummary));
    }

    public List<RecipeDtos.RecipeSummary> getTrending(int limit) {
        return recipeRepo.findTrending(PageRequest.of(0, limit))
                .map(this::toSummary).toList();
    }

    public RecipeDtos.RecipeDetail getById(UUID id) {
        Recipe recipe = recipeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        return toDetail(recipe);
    }

    public List<RecipeDtos.RecipeSummary> getByAuthor(UUID authorId) {
        return recipeRepo.findByAuthorIdOrderByCreatedAtDesc(authorId)
                .stream().map(this::toSummary).toList();
    }

    // ── Create ────────────────────────────────────────────────

    @Transactional
    public RecipeDtos.RecipeSummary create(UUID authorId, RecipeDtos.CreateRecipeRequest req) {
        User author = userService.getById(authorId);

        Recipe recipe = Recipe.builder()
                .author(author)
                .title(req.getTitle())
                .description(req.getDescription())
                .thumbnailUrl(req.getThumbnailUrl())
                .videoUrl(req.getVideoUrl())
                .mediaUrls(req.getMediaUrls() != null ? req.getMediaUrls() : new String[0])
                .countryCode(req.getCountryCode())
                .prepTimeMinutes(req.getPrepTimeMinutes())
                .cookTimeMinutes(req.getCookTimeMinutes())
                .servings(req.getServings() != null ? req.getServings() : 4)
                .difficulty(req.getDifficulty() != null ? req.getDifficulty() : "medium")
                .visibility(req.getVisibility() != null ? req.getVisibility() : "public")
                .caloriesPerServing(req.getCaloriesPerServing())
                .proteinG(req.getProteinG())
                .carbsG(req.getCarbsG())
                .fatG(req.getFatG())
                .fiberG(req.getFiberG())
                .sugarG(req.getSugarG())
                .sodiumMg(req.getSodiumMg())
                .cholesterolMg(req.getCholesterolMg())
                .season(req.getSeason() != null ? req.getSeason() : new String[]{"all"})
                .build();

        Recipe saved = recipeRepo.save(recipe);

        // Tags
        if (req.getTagIds() != null && !req.getTagIds().isEmpty()) {
            List<Tag> tags = tagRepo.findAllById(req.getTagIds());
            saved.setTags(tags);
            tagService.incrementUseCount(tags);
        }

        // Recipe ingredients
        if (req.getIngredients() != null) {
            List<RecipeIngredient> recipeIngredients = IntStream
                    .range(0, req.getIngredients().size())
                    .mapToObj(i -> buildRecipeIngredient(saved, req.getIngredients().get(i), i, author))
                    .collect(Collectors.toList());
            saved.setRecipeIngredients(recipeIngredients);
        }

        // Steps
        if (req.getSteps() != null) {
            List<Step> steps = req.getSteps().stream().map(s -> Step.builder()
                    .recipe(saved)
                    .stepNumber(s.getStepNumber())
                    .title(s.getTitle())
                    .description(s.getDescription())
                    .timer(s.getTimer())
                    .imageUrl(s.getImageUrl())
                    .videoUrl(s.getVideoUrl())
                    .mediaUrls(s.getMediaUrls() != null ? s.getMediaUrls() : new String[0])
                    .build()).collect(Collectors.toList());
            saved.setSteps(steps);
        }

        return toSummary(recipeRepo.save(saved));
    }

    private RecipeIngredient buildRecipeIngredient(Recipe recipe,
                                                    RecipeDtos.RecipeIngredientRequest req,
                                                    int index, User author) {
        RecipeIngredient.RecipeIngredientBuilder builder = RecipeIngredient.builder()
                .recipe(recipe)
                .amount(req.getAmount())
                .unit(req.getUnit())
                .note(req.getNote())
                .orderIndex(req.getOrderIndex() != null ? req.getOrderIndex() : index)
                .isOptional(req.getOptional() != null && req.getOptional());

        if (req.getIngredientId() != null) {
            // Link với ingredient master đã có
            ingredientRepo.findById(req.getIngredientId()).ifPresent(ing -> {
                builder.ingredient(ing);
                ing.setUseCount(ing.getUseCount() + 1);
                ingredientRepo.save(ing);
            });
        } else if (req.getCustomName() != null && !req.getCustomName().isBlank()) {
            // Thử tìm theo tên, nếu chưa có thì để customName
            ingredientRepo.findByNameIgnoreCase(req.getCustomName().trim())
                    .ifPresentOrElse(
                            ing -> {
                                builder.ingredient(ing);
                                ing.setUseCount(ing.getUseCount() + 1);
                                ingredientRepo.save(ing);
                            },
                            () -> builder.customName(req.getCustomName().trim())
                    );
        }

        return builder.build();
    }

    // ── Fork ─────────────────────────────────────────────────

    @Transactional
    public RecipeDtos.RecipeSummary fork(UUID recipeId, UUID userId) {
        Recipe original = recipeRepo.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        User user = userService.getById(userId);

        Recipe forked = Recipe.builder()
                .author(user)
                .forkedFrom(original)
                .title(original.getTitle() + " (Fork)")
                .description(original.getDescription())
                .thumbnailUrl(original.getThumbnailUrl())
                .countryCode(original.getCountryCode())
                .prepTimeMinutes(original.getPrepTimeMinutes())
                .cookTimeMinutes(original.getCookTimeMinutes())
                .servings(original.getServings())
                .difficulty(original.getDifficulty())
                .visibility(original.getVisibility())
                .caloriesPerServing(original.getCaloriesPerServing())
                .proteinG(original.getProteinG())
                .carbsG(original.getCarbsG())
                .fatG(original.getFatG())
                .fiberG(original.getFiberG())
                .tags(original.getTags())
                .season(original.getSeason())
                .build();

        Recipe savedFork = recipeRepo.save(forked);
        original.setForkCount(original.getForkCount() + 1);
        recipeRepo.save(original);

        return toSummary(savedFork);
    }

    @Transactional
    public void delete(UUID recipeId, UUID userId) {
        Recipe recipe = recipeRepo.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        if (!recipe.getAuthor().getId().equals(userId))
            throw new RuntimeException("Not authorized");
        recipeRepo.delete(recipe);
    }

    // ── Save / Unsave ─────────────────────────────────────────

    @Transactional
    public void save(UUID recipeId, UUID userId) {
        if (savedRepo.existsByUserIdAndRecipeId(userId, recipeId)) return;
        SavedRecipe sr = new SavedRecipe();
        sr.setUserId(userId);
        sr.setRecipeId(recipeId);
        savedRepo.save(sr);
        Recipe r = recipeRepo.findById(recipeId).orElseThrow();
        r.setSaveCount(r.getSaveCount() + 1);
        recipeRepo.save(r);
    }

    @Transactional
    public void unsave(UUID recipeId, UUID userId) {
        savedRepo.deleteByUserIdAndRecipeId(userId, recipeId);
        Recipe r = recipeRepo.findById(recipeId).orElseThrow();
        r.setSaveCount(Math.max(0, r.getSaveCount() - 1));
        recipeRepo.save(r);
    }

    public List<UUID> getSavedIds(UUID userId) {
        return savedRepo.findRecipeIdsByUserId(userId);
    }

    public List<RecipeDtos.RecipeSummary> getSavedRecipes(UUID userId) {
        List<UUID> ids = savedRepo.findRecipeIdsByUserId(userId);
        if (ids.isEmpty()) return List.of();
        return recipeRepo.findAllById(ids)
                .stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    // ── Reviews ───────────────────────────────────────────────

    @Transactional
    public void addReview(UUID recipeId, UUID userId, int rating, String comment) {
        if (reviewRepo.existsByRecipeIdAndUserId(recipeId, userId))
            throw new RuntimeException("Bạn đã đánh giá công thức này rồi");

        User user = userService.getById(userId);
        Recipe recipe = recipeRepo.findById(recipeId).orElseThrow();

        reviewRepo.save(Review.builder()
                .recipe(recipe).user(user).rating(rating).comment(comment).build());

        Double avg = reviewRepo.calcAvgRating(recipeId);
        long count = reviewRepo.countByRecipeId(recipeId);
        recipe.setAvgRating(BigDecimal.valueOf(avg != null ? avg : 0));
        recipe.setRatingCount((int) count);
        recipeRepo.save(recipe);
    }

    // ── Mappers ───────────────────────────────────────────────

    public RecipeDtos.RecipeSummary toSummary(Recipe r) {
        return RecipeDtos.RecipeSummary.builder()
                .id(r.getId())
                .author(userService.toSummary(r.getAuthor()))
                .title(r.getTitle())
                .description(r.getDescription())
                .thumbnailUrl(r.getThumbnailUrl())
                .countryCode(r.getCountryCode())
                .difficulty(r.getDifficulty())
                .prepTimeMinutes(r.getPrepTimeMinutes())
                .cookTimeMinutes(r.getCookTimeMinutes())
                .servings(r.getServings())
                .caloriesPerServing(r.getCaloriesPerServing())
                .proteinG(r.getProteinG())
                .carbsG(r.getCarbsG())
                .fatG(r.getFatG())
                .forkCount(r.getForkCount())
                .saveCount(r.getSaveCount())
                .avgRating(r.getAvgRating())
                .ratingCount(r.getRatingCount())
                .tags(r.getTags() == null ? List.of() :
                        r.getTags().stream().map(tagService::toDto).collect(Collectors.toList()))
                .season(r.getSeason())
                .visibility(r.getVisibility())
                .forkedFromId(r.getForkedFrom() != null ? r.getForkedFrom().getId() : null)
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }

    private RecipeDtos.RecipeDetail toDetail(Recipe r) {
        List<RecipeDtos.RecipeIngredientResponse> ingredients =
                r.getRecipeIngredients() == null ? Collections.emptyList() :
                r.getRecipeIngredients().stream().map(this::toIngredientResponse).collect(Collectors.toList());

        List<RecipeDtos.StepResponse> steps =
                r.getSteps() == null ? Collections.emptyList() :
                r.getSteps().stream().map(s -> RecipeDtos.StepResponse.builder()
                        .id(s.getId()).stepNumber(s.getStepNumber()).title(s.getTitle())
                        .description(s.getDescription()).imageUrl(s.getImageUrl())
                        .videoUrl(s.getVideoUrl()).mediaUrls(s.getMediaUrls())
                        .timer(s.getTimer()).build()).collect(Collectors.toList());

        RecipeDtos.RecipeSummary summary = toSummary(r);
        return RecipeDtos.RecipeDetail.builder()
                .id(summary.getId()).author(summary.getAuthor()).title(summary.getTitle())
                .description(summary.getDescription()).thumbnailUrl(summary.getThumbnailUrl())
                .countryCode(summary.getCountryCode()).difficulty(summary.getDifficulty())
                .prepTimeMinutes(summary.getPrepTimeMinutes()).cookTimeMinutes(summary.getCookTimeMinutes())
                .servings(summary.getServings()).caloriesPerServing(summary.getCaloriesPerServing())
                .proteinG(summary.getProteinG()).carbsG(summary.getCarbsG()).fatG(summary.getFatG())
                .fiberG(r.getFiberG()).sugarG(r.getSugarG())
                .sodiumMg(r.getSodiumMg()).cholesterolMg(r.getCholesterolMg())
                .videoUrl(r.getVideoUrl()).mediaUrls(r.getMediaUrls())
                .forkCount(summary.getForkCount()).saveCount(summary.getSaveCount())
                .avgRating(summary.getAvgRating()).ratingCount(summary.getRatingCount())
                .tags(summary.getTags()).season(summary.getSeason()).visibility(summary.getVisibility())
                .forkedFromId(summary.getForkedFromId()).createdAt(summary.getCreatedAt())
                .updatedAt(summary.getUpdatedAt())
                .ingredients(ingredients).steps(steps)
                .build();
    }

    private RecipeDtos.RecipeIngredientResponse toIngredientResponse(RecipeIngredient ri) {
        Ingredient master = ri.getIngredient();
        return RecipeDtos.RecipeIngredientResponse.builder()
                .id(ri.getId())
                .ingredientId(master != null ? master.getId() : null)
                .name(ri.getDisplayName())
                .imageUrl(master != null ? master.getImageUrl() : null)
                .amount(ri.getAmount())
                .unit(ri.getUnit())
                .note(ri.getNote())
                .orderIndex(ri.getOrderIndex())
                .isOptional(ri.getIsOptional())
                .tags(master != null && master.getTags() != null ?
                        master.getTags().stream().map(tagService::toDto).collect(Collectors.toList()) :
                        List.of())
                .build();
    }

    private <T> CommonDtos.PageResponse<T> toPage(org.springframework.data.domain.Page<T> page) {
        return CommonDtos.PageResponse.<T>builder()
                .content(page.getContent()).page(page.getNumber()).size(page.getSize())
                .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
                .last(page.isLast()).build();
    }

    @Transactional
    public RecipeDtos.RecipeSummary update(UUID recipeId, UUID userId, RecipeDtos.CreateRecipeRequest req) {
        Recipe recipe = recipeRepo.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        if (!recipe.getAuthor().getId().equals(userId))
            throw new RuntimeException("Not authorized");

        recipe.setTitle(req.getTitle());
        recipe.setDescription(req.getDescription());
        if (req.getThumbnailUrl() != null) recipe.setThumbnailUrl(req.getThumbnailUrl());
        if (req.getVideoUrl() != null) recipe.setVideoUrl(req.getVideoUrl());
        if (req.getMediaUrls() != null) recipe.setMediaUrls(req.getMediaUrls());
        if (req.getCountryCode() != null) recipe.setCountryCode(req.getCountryCode());
        if (req.getPrepTimeMinutes() != null) recipe.setPrepTimeMinutes(req.getPrepTimeMinutes());
        if (req.getCookTimeMinutes() != null) recipe.setCookTimeMinutes(req.getCookTimeMinutes());
        if (req.getServings() != null) recipe.setServings(req.getServings());
        if (req.getDifficulty() != null) recipe.setDifficulty(req.getDifficulty());
        if (req.getVisibility() != null) recipe.setVisibility(req.getVisibility());
        if (req.getSeason() != null) recipe.setSeason(req.getSeason());
        recipe.setCaloriesPerServing(req.getCaloriesPerServing());
        recipe.setProteinG(req.getProteinG());
        recipe.setCarbsG(req.getCarbsG());
        recipe.setFatG(req.getFatG());
        recipe.setFiberG(req.getFiberG());
        recipe.setSugarG(req.getSugarG());
        recipe.setSodiumMg(req.getSodiumMg());
        recipe.setCholesterolMg(req.getCholesterolMg());

        // Tags
        if (req.getTagIds() != null) {
            List<Tag> tags = tagRepo.findAllById(req.getTagIds());
            recipe.setTags(tags);
        }

        // Ingredients — xóa cũ, tạo mới
        if (req.getIngredients() != null) {
            recipe.getRecipeIngredients().clear();
            List<RecipeIngredient> recipeIngredients = IntStream
                    .range(0, req.getIngredients().size())
                    .mapToObj(i -> buildRecipeIngredient(recipe, req.getIngredients().get(i), i,
                            recipe.getAuthor()))
                    .collect(Collectors.toList());
            recipe.getRecipeIngredients().addAll(recipeIngredients);
        }

        // Steps — xóa cũ, tạo mới
        if (req.getSteps() != null) {
            recipe.getSteps().clear();
            List<Step> steps = req.getSteps().stream().map(s -> Step.builder()
                    .recipe(recipe)
                    .stepNumber(s.getStepNumber())
                    .title(s.getTitle())
                    .description(s.getDescription())
                    .timer(s.getTimer())
                    .imageUrl(s.getImageUrl())
                    .videoUrl(s.getVideoUrl())
                    .mediaUrls(s.getMediaUrls() != null ? s.getMediaUrls() : new String[0])
                    .build()).collect(Collectors.toList());
            recipe.getSteps().addAll(steps);
        }

        return toSummary(recipeRepo.save(recipe));
    }
}