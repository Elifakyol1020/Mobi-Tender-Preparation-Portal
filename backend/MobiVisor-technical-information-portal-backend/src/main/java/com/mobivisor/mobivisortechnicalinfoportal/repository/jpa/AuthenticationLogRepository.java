package com.mobivisor.mobivisortechnicalinfoportal.repository.jpa;


import com.mobivisor.mobivisortechnicalinfoportal.entity.AuthenticationLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthenticationLogRepository extends JpaRepository<AuthenticationLog, Long> {
}