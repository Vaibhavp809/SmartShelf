package com.smartshelf.api.recommendation;

public record RecommendationDto(
        Long bookId,
        String googleBookId,
        String title,
        String authors,
        String category,
        String thumbnailUrl,
        Double score,
        String reason
) {
}

