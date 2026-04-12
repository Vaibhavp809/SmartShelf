package com.smartshelf.api.book;

public record BookDto(
        Long id,
        String googleBookId,
        String title,
        String authors,
        String category,
        String description,
        String thumbnailUrl,
        String previewLink,
        String publishedDate,
        Double averageRating,
        Long ratingsCount
) {
}

