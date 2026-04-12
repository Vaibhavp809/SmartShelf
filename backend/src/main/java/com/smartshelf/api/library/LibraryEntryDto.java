package com.smartshelf.api.library;

import com.smartshelf.api.book.BookDto;

import java.time.Instant;

public record LibraryEntryDto(
        Long entryId,
        UserBookStatus status,
        Instant addedAt,
        BookDto book
) {
}

