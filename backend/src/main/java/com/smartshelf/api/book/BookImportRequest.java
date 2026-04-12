package com.smartshelf.api.book;

import jakarta.validation.constraints.NotBlank;

public record BookImportRequest(@NotBlank String googleBookId) {
}

