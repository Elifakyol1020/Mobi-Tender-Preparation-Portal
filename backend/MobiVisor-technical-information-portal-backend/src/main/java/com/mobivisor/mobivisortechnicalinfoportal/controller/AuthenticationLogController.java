package com.mobivisor.mobivisortechnicalinfoportal.controller;

import com.mobivisor.mobivisortechnicalinfoportal.entity.AuthenticationLog;
import com.mobivisor.mobivisortechnicalinfoportal.repository.jpa.AuthenticationLogRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/logs")
public class AuthenticationLogController {

    private final AuthenticationLogRepository repository;

    public AuthenticationLogController(AuthenticationLogRepository repository) {
        this.repository = repository;
    }

    //Bu method tüm authentication loglarını getirir.
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<AuthenticationLog> getAllLogs() {
        return repository.findAll();
    }
}
