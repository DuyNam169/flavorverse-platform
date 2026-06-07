package com.flavorverse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

/**
 * Người dùng dị ứng với Ingredient (nguyên liệu) cụ thể.
 * Thay thế user_allergy_tags cũ (vốn liên kết với tag — không chính xác).
 */
@Entity
@Table(name = "user_allergies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(UserAllergy.UserAllergyId.class)
public class UserAllergy {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Id
    @Column(name = "ingredient_id")
    private UUID ingredientId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", insertable = false, updatable = false)
    private Ingredient ingredient;

    /**
     * Mức độ dị ứng: mild | moderate | severe
     */
    @Column(length = 20)
    @Builder.Default
    private String severity = "moderate";

    @Column(columnDefinition = "TEXT")
    private String note;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserAllergyId implements Serializable {
        private UUID userId;
        private UUID ingredientId;
    }
}