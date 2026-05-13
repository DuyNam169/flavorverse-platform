package com.flavorverse.service;

import com.flavorverse.dto.RecipeDtos;
import com.flavorverse.dto.CommonDtos;
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
    private final ReviewRepository reviewRepo;
    private final SavedRecipeRepository savedRepo;
    private final UserService userService;

    // ── Queries ──────────────────────────────────────────────

    public CommonDtos.PageResponse<RecipeDtos.RecipeSummary> getFeed(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var p = recipeRepo.findByIsPublicTrueOrderByCreatedAtDesc(pageable);
        return toPage(p.map(this::toSummary));
    }

    public CommonDtos.PageResponse<RecipeDtos.RecipeSummary> search(String q, int page, int size) {
        var pageable = PageRequest.of(page, size);
        var p = recipeRepo.searchPublic(q, pageable);
        return toPage(p.map(this::toSummary));
    }

    public CommonDtos.PageResponse<RecipeDtos.RecipeSummary> discover(String country, String difficulty, int page, int size) {
        var pageable = PageRequest.of(page, size);
        var p = recipeRepo.discover(country, difficulty, pageable);
        return toPage(p.map(this::toSummary));
    }

    public List<RecipeDtos.RecipeSummary> getTrending(int limit) {
        return recipeRepo.findTrending(PageRequest.of(0, limit))
                .map(this::toSummary).toList();
    }

    public RecipeDtos.RecipeDetail getById(UUID id) {
        var recipe = recipeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        return toDetail(recipe);
    }

    // ── Create / Update / Delete ──────────────────────────────

    @Transactional
    public RecipeDtos.RecipeSummary create(UUID authorId, RecipeDtos.CreateRecipeRequest req) {
        User author = userService.getById(authorId);

        Recipe recipe = Recipe.builder()
                .author(author)
                .title(req.getTitle())
                .description(req.getDescription())
                .thumbnailUrl(req.getThumbnailUrl())
                .countryCode(req.getCountryCode())
                .prepTimeMinutes(req.getPrepTimeMinutes())
                .cookTimeMinutes(req.getCookTimeMinutes())
                .servings(req.getServings() != null ? req.getServings() : 4)
                .difficulty(req.getDifficulty() != null ? req.getDifficulty() : "medium")
                .isPublic(req.getIsPublic() != null ? req.getIsPublic() : true)
                .caloriesPerServing(req.getCaloriesPerServing())
                .proteinG(req.getProteinG())
                .carbsG(req.getCarbsG())
                .fatG(req.getFatG())
                .fiberG(req.getFiberG())
                .sugarG(req.getSugarG())
                .tags(req.getTags())
                .season(req.getSeason() != null ? req.getSeason() : new String[]{"all"})
                .build();

        Recipe saved = recipeRepo.save(recipe);

        if (req.getIngredients() != null) {
            List<Ingredient> ingredients = IntStream.range(0, req.getIngredients().size())
                    .mapToObj(i -> {
                        var r = req.getIngredients().get(i);
                        return Ingredient.builder()
                                .recipe(saved)
                                .name(r.getName())
                                .amount(r.getAmount())
                                .unit(r.getUnit())
                                .note(r.getNote())
                                .orderIndex(r.getOrderIndex() != null ? r.getOrderIndex() : i)
                                .isOptional(r.getOptional() != null && r.getOptional())
                                .build();
                    }).collect(Collectors.toList());
            saved.setIngredients(ingredients);
        }

        if (req.getSteps() != null) {
            List<Step> steps = req.getSteps().stream().map(s ->
                    Step.builder()
                            .recipe(saved)
                            .stepNumber(s.getStepNumber())
                            .title(s.getTitle())
                            .description(s.getDescription())
                            .timerSeconds(s.getTimerSeconds())
                            .build()
            ).collect(Collectors.toList());
            saved.setSteps(steps);
        }

        return toSummary(recipeRepo.save(saved));
    }

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
                .isPublic(true)
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
        savedRepo.save(new SavedRecipe(userId, recipeId, null));
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

    // ── Reviews ───────────────────────────────────────────────

    @Transactional
    public void addReview(UUID recipeId, UUID userId, int rating, String comment) {
        if (reviewRepo.existsByRecipeIdAndUserId(recipeId, userId))
            throw new RuntimeException("Already reviewed");

        User user = userService.getById(userId);
        Recipe recipe = recipeRepo.findById(recipeId).orElseThrow();

        reviewRepo.save(Review.builder()
                .recipe(recipe).user(user).rating(rating).comment(comment).build());

        // Update stats
        Double avg = reviewRepo.calcAvgRating(recipeId);
        long count = reviewRepo.countByRecipeId(recipeId);
        recipe.setAvgRating(BigDecimal.valueOf(avg != null ? avg : 0));
        recipe.setRatingCount((int) count);
        recipeRepo.save(recipe);
    }

    public List<RecipeDtos.RecipeSummary> getByAuthor(UUID authorId) {
        return recipeRepo.findByAuthorIdOrderByCreatedAtDesc(authorId)
                .stream().map(this::toSummary).toList();
    }

    // ── Mappers ───────────────────────────────────────────────

    public RecipeDtos.RecipeSummary toSummary(Recipe r) {
        return RecipeDtos.RecipeSummary.builder()
                .id(r.getId())
                .author(userService.toDto(r.getAuthor()))
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
                .tags(r.getTags())
                .season(r.getSeason())
                .isPublic(r.getIsPublic())
                .forkedFromId(r.getForkedFrom() != null ? r.getForkedFrom().getId() : null)
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }

    private RecipeDtos.RecipeDetail toDetail(Recipe r) {
        List<RecipeDtos.IngredientResponse> ingredients = r.getIngredients() == null ?
            Collections.emptyList() :
            r.getIngredients().stream().map(i -> RecipeDtos.IngredientResponse.builder()
                .id(i.getId()).name(i.getName()).amount(i.getAmount())
                .unit(i.getUnit()).note(i.getNote()).orderIndex(i.getOrderIndex())
                .isOptional(i.getIsOptional()).build()).collect(Collectors.toList());

        List<RecipeDtos.StepResponse> steps = r.getSteps() == null ?
            Collections.emptyList() :
            r.getSteps().stream().map(s -> RecipeDtos.StepResponse.builder()
                .id(s.getId()).stepNumber(s.getStepNumber()).title(s.getTitle())
                .description(s.getDescription()).imageUrl(s.getImageUrl())
                .timerSeconds(s.getTimerSeconds()).build()).collect(Collectors.toList());

        RecipeDtos.RecipeSummary summary = toSummary(r);
        return RecipeDtos.RecipeDetail.builder()
                .id(summary.getId()).author(summary.getAuthor()).title(summary.getTitle())
                .description(summary.getDescription()).thumbnailUrl(summary.getThumbnailUrl())
                .countryCode(summary.getCountryCode()).difficulty(summary.getDifficulty())
                .prepTimeMinutes(summary.getPrepTimeMinutes()).cookTimeMinutes(summary.getCookTimeMinutes())
                .servings(summary.getServings()).caloriesPerServing(summary.getCaloriesPerServing())
                .proteinG(summary.getProteinG()).carbsG(summary.getCarbsG()).fatG(summary.getFatG())
                .forkCount(summary.getForkCount()).saveCount(summary.getSaveCount())
                .avgRating(summary.getAvgRating()).ratingCount(summary.getRatingCount())
                .tags(summary.getTags()).season(summary.getSeason()).isPublic(summary.getIsPublic())
                .forkedFromId(summary.getForkedFromId()).createdAt(summary.getCreatedAt())
                .updatedAt(summary.getUpdatedAt())
                .ingredients(ingredients).steps(steps)
                .build();
    }

    private <T> CommonDtos.PageResponse<T> toPage(org.springframework.data.domain.Page<T> page) {
        return CommonDtos.PageResponse.<T>builder()
                .content(page.getContent()).page(page.getNumber()).size(page.getSize())
                .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
                .last(page.isLast()).build();
    }
}
