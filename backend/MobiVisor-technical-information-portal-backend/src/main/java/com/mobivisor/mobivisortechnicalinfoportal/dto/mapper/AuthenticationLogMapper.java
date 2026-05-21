package com.mobivisor.mobivisortechnicalinfoportal.dto.mapper;

import com.mobivisor.mobivisortechnicalinfoportal.entity.AuthenticationLog;

import java.time.LocalDateTime;

public class AuthenticationLogMapper {

    public static AuthenticationLog toEntity(String username, String role, String ipAddress) {
        AuthenticationLog log = new AuthenticationLog();
        log.setUsername(username);
        log.setRole(role);
        log.setLoginTime(LocalDateTime.now());
        log.setIpAddress(ipAddress);
        return log;
    }
}