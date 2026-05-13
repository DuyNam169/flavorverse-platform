package com.flavorverse.repository;

import com.flavorverse.entity.MealPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MealPlanRepository extends JpaRepository<MealPlan, UUID> {
    Optional<MealPlan> findByUserIdAndWeekStart(UUID userId, LocalDate weekStart);
    List<MealPlan> findByUserIdOrderByWeekStartDesc(UUID userId);
}