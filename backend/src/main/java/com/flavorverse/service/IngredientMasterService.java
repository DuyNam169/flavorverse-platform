package com.flavorverse.service;

import com.flavorverse.dto.RecipeDtos;
import com.flavorverse.entity.IngredientMaster;
import com.flavorverse.entity.Tag;
import com.flavorverse.repository.IngredientMasterRepository;
import com.flavorverse.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IngredientMasterService {

    private final IngredientMasterRepository repo;
    private final TagRepository tagRepo; // ← inject thêm

    public List<RecipeDtos.IngredientMasterResponse> search(String q) {
        return repo.search(q, PageRequest.of(0, 20))
                .stream().map(this::toDto).toList();
    }

    public List<RecipeDtos.IngredientMasterResponse> getPopular() {
        return repo.findTop20ByOrderByUseCountDesc()
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public RecipeDtos.IngredientMasterResponse create(
            RecipeDtos.IngredientMasterRequest req, UUID userId) {

        repo.findByNameIgnoreCase(req.getName()).ifPresent(e -> {
            throw new RuntimeException("Nguyên liệu đã tồn tại: " + e.getName());
        });

        // Resolve tags từ DB theo tagIds
        List<Tag> tags = (req.getTagIds() != null && !req.getTagIds().isEmpty())
                ? tagRepo.findAllById(req.getTagIds())
                : List.of();

        IngredientMaster saved = repo.save(IngredientMaster.builder()
                .name(req.getName().trim())
                .imageUrl(req.getImageUrl())
                .tags(tags) // ← List<Tag> thay vì String[]
                .createdBy(userId)
                .build());

        // Tăng useCount cho từng tag
        tags.forEach(t -> {
            t.setUseCount(t.getUseCount() + 1);
            tagRepo.save(t);
        });

        return toDto(saved);
    }

    @Transactional
    public void incrementUseCount(UUID masterId) {
        repo.findById(masterId).ifPresent(m -> {
            m.setUseCount(m.getUseCount() + 1);
            repo.save(m);
        });
    }

    // ← sửa toDto map tags đúng kiểu
    private RecipeDtos.IngredientMasterResponse toDto(IngredientMaster m) {
        return RecipeDtos.IngredientMasterResponse.builder()
                .id(m.getId())
                .name(m.getName())
                .imageUrl(m.getImageUrl())
                .tags(m.getTags() == null ? List.of() :
                        m.getTags().stream()
                                .map(t -> RecipeDtos.TagDto.builder()
                                        .id(t.getId())
                                        .name(t.getName())
                                        .slug(t.getSlug())
                                        .build())
                                .toList())
                .useCount(m.getUseCount())
                .build();
    }
}