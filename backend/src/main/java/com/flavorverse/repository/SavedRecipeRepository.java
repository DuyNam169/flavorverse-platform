package com.flavorverse.repository;

import com.flavorverse.entity.SavedRecipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SavedRecipeRepository extends JpaRepository<SavedRecipe, SavedRecipe.SavedRecipeId> {

    @Query("SELECT s.recipeId FROM SavedRecipe s WHERE s.userId = :userId")
    List<UUID> findRecipeIdsByUserId(@Param("userId") UUID userId);

    boolean existsByUserIdAndRecipeId(UUID userId, UUID recipeId);

    @Modifying
    @Query("DELETE FROM SavedRecipe s WHERE s.userId = :userId AND s.recipeId = :recipeId")
    void deleteByUserIdAndRecipeId(@Param("userId") UUID userId, @Param("recipeId") UUID recipeId);
}