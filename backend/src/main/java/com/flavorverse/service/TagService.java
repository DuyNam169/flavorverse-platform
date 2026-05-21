package com.flavorverse.service;

import com.flavorverse.entity.Tag;
import com.flavorverse.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.text.Normalizer;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepo;

    public List<Tag> search(String q) {
        return tagRepo.searchByName(q);
    }

    public List<Tag> getByType(String type) {
        return tagRepo.findByTypeOrderByUseCountDesc(type);
    }

    @Transactional
    public Tag findOrCreate(String name, String type) {
        String trimmed = name.trim();
        return tagRepo.findByName(trimmed).orElseGet(() ->
            tagRepo.save(Tag.builder()
                    .name(trimmed)
                    .slug(generateSlug(trimmed))
                    .type(type)
                    .build()));
    }

    private String generateSlug(String input) {
        String slug = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-").trim();
        String base = slug;
        int i = 1;
        while (tagRepo.findBySlug(slug).isPresent()) slug = base + "-" + i++;
        return slug;
    }
}