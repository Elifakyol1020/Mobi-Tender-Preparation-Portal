package com.mobivisor.mobivisortechnicalinfoportal.dto.request;

public record RegisterRequest(
        String email,
        String username,
        String password
) { }
