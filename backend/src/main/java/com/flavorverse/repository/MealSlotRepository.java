package com.flavorverse.repository;

import com.flavorverse.entity.MealSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MealSlotRepository extends JpaRepository<MealSlot, UUID> {
    List<MealSlot> findByMealPlanId(UUID planId);

    @Modifying
    @Query("DELETE FROM MealSlot s WHERE s.mealPlan.id = :planId AND s.dayOfWeek = :day AND s.mealType = :mealType")
    void deleteByPlanDayMeal(@Param("planId") UUID planId, @Param("day") int day, @Param("mealType") String mealType);
}