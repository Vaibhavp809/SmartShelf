package com.smartshelf.api.recommendation;

public record AnalyticsDto(
        Long bookId,
        String googleBookId,
        String title,
        String category,
        String thumbnailUrl,
        Double averageRating,
        Long reviewCount
) {
}
