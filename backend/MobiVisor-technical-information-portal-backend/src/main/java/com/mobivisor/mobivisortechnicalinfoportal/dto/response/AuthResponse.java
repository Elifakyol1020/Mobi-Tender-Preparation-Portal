package com.mobivisor.mobivisortechnicalinfoportal.dto.response;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long accessTokenExpiresIn,
        String email,
        String username,
        String role
) { }
