package com.mobivisor.mobivisortechnicalinfoportal.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class AuthenticationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    private String role;

    private LocalDateTime loginTime;

    private String ipAddress;

    public AuthenticationLog() {
    }
    public AuthenticationLog(String username, String role, LocalDateTime loginTime, String ipAddress) {
        this.username = username;
        this.role = role;
        this.loginTime = loginTime;
        this.ipAddress = ipAddress;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getLoginTime() {
        return loginTime;
    }

    public void setLoginTime(LocalDateTime loginTime) {
        this.loginTime = loginTime;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
}
