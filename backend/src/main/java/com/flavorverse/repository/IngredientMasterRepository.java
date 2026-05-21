package com.flavorverse.repository;

import com.flavorverse.entity.IngredientMaster;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface IngredientMasterRepository extends JpaRepository<IngredientMaster, UUID> {
    
    @Query("SELECT i FROM IngredientMaster i WHERE LOWER(i.name) LIKE LOWER(CONCAT('%', :q, '%')) ORDER BY i.useCount DESC")
    List<IngredientMaster> search(@Param("q") String q, Pageable pageable);
    
    Optional<IngredientMaster> findByNameIgnoreCase(String name);
    
    List<IngredientMaster> findTop20ByOrderByUseCountDesc();
}
