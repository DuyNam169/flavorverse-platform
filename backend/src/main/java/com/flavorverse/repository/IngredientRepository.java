package com.flavorverse.repository;

import com.flavorverse.entity.Ingredient;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, UUID> {

    Optional<Ingredient> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    @Query("SELECT i FROM Ingredient i WHERE LOWER(i.name) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(i.nameVi) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "ORDER BY i.useCount DESC")
    List<Ingredient> search(@Param("q") String q, Pageable pageable);

    List<Ingredient> findTop20ByOrderByUseCountDesc();

    @Query("SELECT i FROM Ingredient i JOIN i.tags t WHERE t.id = :tagId ORDER BY i.useCount DESC")
    List<Ingredient> findByTagId(@Param("tagId") UUID tagId, Pageable pageable);
}