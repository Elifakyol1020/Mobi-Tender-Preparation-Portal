package com.mobivisor.mobivisortechnicalinfoportal.dto.response;

import com.mobivisor.mobivisortechnicalinfoportal.enumarate.Role;

public record UserResponse(
        Long id,
        String email,
        String userName,
        Role role
) {}
