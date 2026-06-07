package com.flavorverse.repository;

import com.flavorverse.entity.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, UUID> {

    @Query("SELECT r FROM Recipe r WHERE r.visibility = 'public' AND r.status = 'published' ORDER BY r.createdAt DESC")
    Page<Recipe> findPublicOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT r FROM Recipe r WHERE r.visibility = 'public' AND r.status = 'published' AND " +
           "(LOWER(r.title) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           " LOWER(r.description) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Recipe> searchPublic(@Param("q") String q, Pageable pageable);

    @Query("SELECT r FROM Recipe r WHERE r.visibility = 'public' AND r.status = 'published' " +
           "AND (:country IS NULL OR r.countryCode = :country) " +
           "AND (:difficulty IS NULL OR r.difficulty = :difficulty) " +
           "ORDER BY r.avgRating DESC, r.ratingCount DESC")
    Page<Recipe> discover(@Param("country") String country,
                          @Param("difficulty") String difficulty,
                          Pageable pageable);

    @Query("SELECT r FROM Recipe r WHERE r.visibility = 'public' AND r.status = 'published' " +
           "ORDER BY r.forkCount DESC")
    Page<Recipe> findTrending(Pageable pageable);

    List<Recipe> findByAuthorIdOrderByCreatedAtDesc(UUID authorId);
    long countByAuthorId(UUID authorId);
}