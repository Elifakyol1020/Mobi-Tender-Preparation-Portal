package com.mobivisor.mobivisortechnicalinfoportal.service;

import com.mobivisor.mobivisortechnicalinfoportal.entity.AuthenticationLog;
import com.mobivisor.mobivisortechnicalinfoportal.dto.mapper.AuthenticationLogMapper;
import com.mobivisor.mobivisortechnicalinfoportal.repository.jpa.AuthenticationLogRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationLogService {

    private final AuthenticationLogRepository repository;

    public AuthenticationLogService(AuthenticationLogRepository repository) {
        this.repository = repository;
    }

    public void logAuthentication(String username, String role, String ipAddress) {
        AuthenticationLog log = AuthenticationLogMapper.toEntity(username, role, ipAddress);
        repository.save(log);
    }
}