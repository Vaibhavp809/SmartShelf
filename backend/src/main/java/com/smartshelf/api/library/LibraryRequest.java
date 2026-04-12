package com.smartshelf.api.library;

import jakarta.validation.constraints.NotNull;

public record LibraryRequest(
        @NotNull Long bookId,
        @NotNull UserBookStatus status
) {
}

