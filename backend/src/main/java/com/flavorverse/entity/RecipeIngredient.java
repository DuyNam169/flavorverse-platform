package com.flavorverse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Nguyên liệu sử dụng trong một công thức cụ thể.
 * - Nếu ingredient_id != null → liên kết với bảng ingredients (master)
 * - Nếu ingredient_id == null → dùng custom_name (nguyên liệu chưa có trong master)
 */
@Entity
@Table(name = "recipe_ingredients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    /**
     * Liên kết với ingredient master (có thể null nếu là custom_name)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id")
    private Ingredient ingredient;

    /**
     * Tên tự nhập nếu ingredient chưa có trong master
     */
    @Column(name = "custom_name", length = 200)
    private String customName;

    private BigDecimal amount;
    private String unit;
    private String note;

    @Column(name = "order_index", nullable = false)
    @Builder.Default
    private Integer orderIndex = 0;

    @Column(name = "is_optional", nullable = false)
    @Builder.Default
    private Boolean isOptional = false;

    /**
     * Trả về tên hiển thị: ưu tiên ingredient.name, fallback về customName
     */
    @Transient
    public String getDisplayName() {
        return ingredient != null ? ingredient.getName() : customName;
    }
}