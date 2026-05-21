package com.flavorverse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import java.util.List;

@Entity
@Table(name = "tags")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Tag {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String slug;

    @Builder.Default
    private String type = "general";

    @Builder.Default
    @Column(name = "use_count")
    private Integer useCount = 0;

    @ManyToMany(mappedBy = "tags", fetch = FetchType.LAZY)
    private List<Recipe> recipes;

    @ManyToMany(mappedBy = "tags", fetch = FetchType.LAZY)
    private List<IngredientMaster> ingredientMasters;
}