package com.flavorverse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "google_id", unique = true)
    private String googleId;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(name = "display_name", length = 100)
    private String displayName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String location;

    @Column(name = "country_code", length = 2)
    private String countryCode;

    private BigDecimal latitude;
    private BigDecimal longitude;

    @Column(name = "calorie_goal")
    @Builder.Default
    private Integer calorieGoal = 2000;

    @Column(name = "diet_type", length = 50)
    @Builder.Default
    private String dietType = "normal";

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Allergies được load qua UserAllergyRepository khi cần (tránh eager load nặng)
}