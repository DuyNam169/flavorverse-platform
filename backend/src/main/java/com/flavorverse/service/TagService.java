package com.flavorverse.service;

import com.flavorverse.dto.IngredientDtos;
import com.flavorverse.entity.Tag;
import com.flavorverse.entity.User;
import com.flavorverse.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepo;

    public List<IngredientDtos.TagDto> search(String q) {
        return tagRepo.searchByName(q).stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<IngredientDtos.TagDto> getByType(String type) {
        return tagRepo.findByTypeOrderByUseCountDesc(type).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    public List<IngredientDtos.TagDto> getPopular() {
        return tagRepo.findTop20ByOrderByUseCountDesc().stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public Tag findOrCreate(String name, String type, User createdBy) {
        String trimmed = name.trim();
        return tagRepo.findByName(trimmed).orElseGet(() ->
                tagRepo.save(Tag.builder()
                        .name(trimmed)
                        .slug(generateSlug(trimmed))
                        .type(type)
                        .createdBy(createdBy)
                        .build()));
    }

    @Transactional
    public void incrementUseCount(List<Tag> tags) {
        tags.forEach(t -> {
            t.setUseCount(t.getUseCount() + 1);
            tagRepo.save(t);
        });
    }

    public IngredientDtos.TagDto toDto(Tag t) {
        return IngredientDtos.TagDto.builder()
                .id(t.getId())
                .name(t.getName())
                .slug(t.getSlug())
                .type(t.getType())
                .useCount(t.getUseCount())
                .build();
    }

    private String generateSlug(String input) {
        String slug = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
        String base = slug;
        int i = 1;
        while (tagRepo.findBySlug(slug).isPresent()) {
            slug = base + "-" + i++;
        }
        return slug;
    }
}