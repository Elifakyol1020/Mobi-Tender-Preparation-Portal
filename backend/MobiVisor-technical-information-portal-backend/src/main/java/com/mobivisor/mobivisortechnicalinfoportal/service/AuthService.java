package com.mobivisor.mobivisortechnicalinfoportal.service;

import com.mobivisor.mobivisortechnicalinfoportal.dto.request.AuthRequest;
import com.mobivisor.mobivisortechnicalinfoportal.dto.request.RegisterRequest;
import com.mobivisor.mobivisortechnicalinfoportal.dto.response.AuthResponse;
import com.mobivisor.mobivisortechnicalinfoportal.entity.BlacklistToken;
import com.mobivisor.mobivisortechnicalinfoportal.entity.User;
import com.mobivisor.mobivisortechnicalinfoportal.enumarate.Role;
import com.mobivisor.mobivisortechnicalinfoportal.repository.jpa.BlacklistTokenRepository;
import com.mobivisor.mobivisortechnicalinfoportal.repository.jpa.UserRepository;
import com.mobivisor.mobivisortechnicalinfoportal.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class AuthService {

    private final JwtService jwtService;
    private final BlacklistTokenRepository blacklistTokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    public AuthService(JwtService jwtService,
                       BlacklistTokenRepository blacklistTokenRepository,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {

        this.jwtService = jwtService;
        this.blacklistTokenRepository = blacklistTokenRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(RegisterRequest request) {
        validateRegisterRequest(request);
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email zaten kayıtlı");
        }

        User user = new User();
        user.setEmail(email);
        user.setUserName(request.username().trim());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);

        User savedUser = userRepository.save(user);
        logger.info("Yeni kullanıcı register oldu: {}", savedUser.getEmail());
        return buildAuthResponse(savedUser);
    }

    public AuthResponse login(AuthRequest request) {
        validateLoginRequest(request);

        User user = userRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Email veya şifre hatalı"));

        if (user.getPassword() == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Email veya şifre hatalı");
        }

        logger.info("Kullanıcı giriş yaptı: {}", user.getEmail());
        return buildAuthResponse(user);
    }

    public AuthResponse refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalArgumentException("Refresh token zorunlu");
        }

        jwtService.validateRefreshToken(refreshToken);
        String email = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı"));
        return buildAuthResponse(user);
    }

    public String createRefreshToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı"));
        return jwtService.generateRefreshToken(user.getEmail(), user.getRole());
    }

    public void logout(String accessToken, String refreshToken) {
        blacklistToken(accessToken);
        if (refreshToken != null && !refreshToken.isBlank()) {
            blacklistToken(refreshToken);
        }
    }

    private void blacklistToken(String token) {
        Date expiryDate = jwtService.extractExpiration(token);
        blacklistTokenRepository.save(new BlacklistToken(token, expiryDate));
        logger.info("Token kara listeye alındı: expires={}", expiryDate);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole());
        return new AuthResponse(
                accessToken,
                "Bearer",
                jwtService.getAccessTokenExpirationTime(),
                user.getEmail(),
                user.getUserName(),
                "ROLE_" + user.getRole().name()
        );
    }

    private void validateRegisterRequest(RegisterRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Register bilgileri zorunlu");
        }
        if (request.email() == null || request.email().isBlank()) {
            throw new IllegalArgumentException("Email zorunlu");
        }
        if (request.username() == null || request.username().isBlank()) {
            throw new IllegalArgumentException("Kullanıcı adı zorunlu");
        }
        if (request.password() == null || request.password().length() < 6) {
            throw new IllegalArgumentException("Şifre en az 6 karakter olmalı");
        }
    }

    private void validateLoginRequest(AuthRequest request) {
        if (request == null || request.email() == null || request.email().isBlank()
                || request.password() == null || request.password().isBlank()) {
            throw new IllegalArgumentException("Email ve şifre zorunlu");
        }
    }
}
