package com.flavorverse.repository;

import com.flavorverse.entity.UserAllergy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserAllergyRepository extends JpaRepository<UserAllergy, UserAllergy.UserAllergyId> {

    List<UserAllergy> findByUserId(UUID userId);

    Optional<UserAllergy> findByUserIdAndIngredientId(UUID userId, UUID ingredientId);

    boolean existsByUserIdAndIngredientId(UUID userId, UUID ingredientId);

    @Modifying
    @Query("DELETE FROM UserAllergy a WHERE a.userId = :userId AND a.ingredientId = :ingredientId")
    void deleteByUserIdAndIngredientId(@Param("userId") UUID userId,
                                        @Param("ingredientId") UUID ingredientId);

    /** Trả về danh sách ingredientId mà user dị ứng — dùng để filter recipe */
    @Query("SELECT a.ingredientId FROM UserAllergy a WHERE a.userId = :userId")
    List<UUID> findAllergenIdsByUserId(@Param("userId") UUID userId);
}