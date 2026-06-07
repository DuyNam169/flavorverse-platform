package com.flavorverse.repository;

import com.flavorverse.entity.RecipeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredient, UUID> {

    List<RecipeIngredient> findByRecipeIdOrderByOrderIndexAsc(UUID recipeId);

    /** Tìm các công thức dùng một ingredient cụ thể */
    @Query("SELECT ri.recipe.id FROM RecipeIngredient ri WHERE ri.ingredient.id = :ingredientId")
    List<UUID> findRecipeIdsByIngredientId(@Param("ingredientId") UUID ingredientId);

    void deleteByRecipeId(UUID recipeId);
}