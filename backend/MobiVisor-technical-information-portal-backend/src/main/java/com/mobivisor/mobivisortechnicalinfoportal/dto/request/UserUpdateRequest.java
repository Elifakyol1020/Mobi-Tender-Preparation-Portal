package com.mobivisor.mobivisortechnicalinfoportal.dto.request;

import com.mobivisor.mobivisortechnicalinfoportal.enumarate.Role;

public record UserUpdateRequest(String email,
                                String username,
                                Role role) {
}
