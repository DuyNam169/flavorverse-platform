package com.flavorverse.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ReviewDtos {

    @Data
    public static class CreateReviewRequest {
        @NotNull @Min(1) @Max(5)
        private Integer rating;

        @Size(max = 2000)
        private String comment;

        private String[] mediaUrls;
    }

    @Data
    @Builder
    public static class ReviewResponse {
        private UUID id;
        private UserDtos.UserSummary user;
        private Integer rating;
        private String comment;
        private String[] mediaUrls;
        private LocalDateTime createdAt;
    }
}