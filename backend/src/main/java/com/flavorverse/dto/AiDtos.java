package com.flavorverse.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.util.List;

public class AiDtos {

    @Data public static class AiChatRequest {
        @NotBlank private String message;
        private List<ChatMessage> history;

        @Data @AllArgsConstructor public static class ChatMessage {
            private String role;
            private String content;
        }
    }

    @Data @Builder public static class AiChatResponse {
        private String reply;
        private List<RecipeDtos.RecipeSummary> suggestedRecipes;
    }
}