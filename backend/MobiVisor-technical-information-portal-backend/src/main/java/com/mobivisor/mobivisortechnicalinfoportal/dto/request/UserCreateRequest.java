package com.mobivisor.mobivisortechnicalinfoportal.dto.request;

import com.mobivisor.mobivisortechnicalinfoportal.enumarate.Role;

public record UserCreateRequest(String email,
                                String username,
                                String password,
                                Role role) {
}
