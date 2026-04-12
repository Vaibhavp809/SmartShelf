package com.smartshelf.api.auth;

public record AuthResponse(
        String token,
        Long userId,
        String fullName,
        String email
) {
}

