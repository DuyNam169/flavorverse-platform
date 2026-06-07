package com.flavorverse.repository;

import com.flavorverse.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TagRepository extends JpaRepository<Tag, UUID> {

    Optional<Tag> findBySlug(String slug);
    Optional<Tag> findByName(String name);
    boolean existsByName(String name);

    @Query("SELECT t FROM Tag t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :q, '%')) ORDER BY t.useCount DESC")
    List<Tag> searchByName(String q);

    List<Tag> findByTypeOrderByUseCountDesc(String type);

    List<Tag> findTop20ByOrderByUseCountDesc();
}