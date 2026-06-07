package com.flavorverse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Bảng nguyên liệu thống nhất — thay thế cả ingredient_master cũ.
 * Mỗi record là một loại nguyên liệu (vd: "Thịt bò", "Cà chua", "Muối").
 * Nguyên liệu trong từng công thức được quản lý ở RecipeIngredient.
 */
@Entity
@Table(name = "ingredients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ingredient {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** Tên chuẩn hóa (unique) */
    @Column(nullable = false, unique = true, length = 200)
    private String name;

    /** Tên tiếng Việt (tuỳ chọn) */
    @Column(name = "name_vi", length = 200)
    private String nameVi;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Số lần được dùng trong các công thức */
    @Column(name = "use_count", nullable = false)
    @Builder.Default
    private Integer useCount = 0;

    /** Người tạo nguyên liệu này */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    /** Tags phân loại nguyên liệu (ingredient_category, allergen, ...) */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "ingredient_tags",
        joinColumns = @JoinColumn(name = "ingredient_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private List<Tag> tags = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}