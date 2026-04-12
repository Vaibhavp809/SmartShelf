package com.smartshelf.api.review;

import java.time.Instant;

public record ReviewDto(
        Long id,
        Long bookId,
        Long userId,
        String reviewerName,
        Integer rating,
        String comment,
        Instant createdAt
) {
}

