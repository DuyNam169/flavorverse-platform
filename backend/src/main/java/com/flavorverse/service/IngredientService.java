package com.flavorverse.service;

import com.flavorverse.dto.IngredientDtos;
import com.flavorverse.entity.Ingredient;
import com.flavorverse.entity.Tag;
import com.flavorverse.entity.User;
import com.flavorverse.repository.IngredientRepository;
import com.flavorverse.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IngredientService {

    private final IngredientRepository ingredientRepo;
    private final TagRepository tagRepo;
    private final TagService tagService;

    // ── Queries ───────────────────────────────────────────────

    public List<IngredientDtos.IngredientResponse> search(String q) {
        return ingredientRepo.search(q, PageRequest.of(0, 20))
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<IngredientDtos.IngredientResponse> getPopular() {
        return ingredientRepo.findTop20ByOrderByUseCountDesc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public IngredientDtos.IngredientResponse getById(UUID id) {
        Ingredient ing = ingredientRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ingredient not found: " + id));
        return toDto(ing);
    }

    // ── Create ────────────────────────────────────────────────

    @Transactional
    public IngredientDtos.IngredientResponse create(
            IngredientDtos.CreateIngredientRequest req, User creator) {

        String name = req.getName().trim();
        if (ingredientRepo.existsByNameIgnoreCase(name))
            throw new RuntimeException("Nguyên liệu đã tồn tại: " + name);

        List<Tag> tags = resolveTagIds(req.getTagIds());

        Ingredient saved = ingredientRepo.save(Ingredient.builder()
                .name(name)
                .nameVi(req.getNameVi())
                .imageUrl(req.getImageUrl())
                .description(req.getDescription())
                .tags(tags)
                .createdBy(creator)
                .build());

        tagService.incrementUseCount(tags);

        return toDto(saved);
    }

    // ── Find or create (dùng khi tạo recipe với ingredient mới) ──

    @Transactional
    public Ingredient findOrCreate(String name, User creator) {
        return ingredientRepo.findByNameIgnoreCase(name.trim())
                .orElseGet(() -> ingredientRepo.save(Ingredient.builder()
                        .name(name.trim())
                        .createdBy(creator)
                        .build()));
    }

    // ── Increment use count ───────────────────────────────────

    @Transactional
    public void incrementUseCount(UUID ingredientId) {
        ingredientRepo.findById(ingredientId).ifPresent(ing -> {
            ing.setUseCount(ing.getUseCount() + 1);
            ingredientRepo.save(ing);
        });
    }

    // ── Mapper ────────────────────────────────────────────────

    public IngredientDtos.IngredientResponse toDto(Ingredient i) {
        return IngredientDtos.IngredientResponse.builder()
                .id(i.getId())
                .name(i.getName())
                .nameVi(i.getNameVi())
                .imageUrl(i.getImageUrl())
                .description(i.getDescription())
                .useCount(i.getUseCount())
                .tags(i.getTags() == null ? List.of() :
                        i.getTags().stream().map(tagService::toDto).collect(Collectors.toList()))
                .createdById(i.getCreatedBy() != null ? i.getCreatedBy().getId() : null)
                .createdByUsername(i.getCreatedBy() != null ? i.getCreatedBy().getUsername() : null)
                .createdAt(i.getCreatedAt())
                .build();
    }

    private List<Tag> resolveTagIds(List<UUID> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) return List.of();
        return tagRepo.findAllById(tagIds);
    }
}