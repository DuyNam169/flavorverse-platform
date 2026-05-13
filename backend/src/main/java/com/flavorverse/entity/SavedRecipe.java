package com.flavorverse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "saved_recipes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(SavedRecipe.SavedRecipeId.class)
public class SavedRecipe {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Id
    @Column(name = "recipe_id")
    private UUID recipeId;

    @CreationTimestamp
    @Column(name = "saved_at", updatable = false)
    private LocalDateTime savedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SavedRecipeId implements Serializable {
        private UUID userId;
        private UUID recipeId;
    }
}