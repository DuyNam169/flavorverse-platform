package com.flavorverse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "meal_slots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private MealPlan mealPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(name = "day_of_week")
    private Integer dayOfWeek;   // 0=Mon … 6=Sun

    @Column(name = "meal_type")
    private String mealType;     // breakfast | lunch | dinner | custom

    @Column(name = "custom_time")
    private LocalTime customTime;

    @Column(name = "custom_label")
    private String customLabel;

    @Builder.Default
    private Integer servings = 1;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
