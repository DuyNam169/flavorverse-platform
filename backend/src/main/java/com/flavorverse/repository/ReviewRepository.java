package com.flavorverse.repository;

import com.flavorverse.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByRecipeIdOrderByCreatedAtDesc(UUID recipeId);
    Optional<Review> findByRecipeIdAndUserId(UUID recipeId, UUID userId);
    boolean existsByRecipeIdAndUserId(UUID recipeId, UUID userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.recipe.id = :recipeId")
    Double calcAvgRating(@Param("recipeId") UUID recipeId);

    long countByRecipeId(UUID recipeId);
}