package com.mobivisor.mobivisortechnicalinfoportal.controller;

import com.mobivisor.mobivisortechnicalinfoportal.dto.request.AuthRequest;
import com.mobivisor.mobivisortechnicalinfoportal.dto.request.RegisterRequest;
import com.mobivisor.mobivisortechnicalinfoportal.dto.response.AuthResponse;
import com.mobivisor.mobivisortechnicalinfoportal.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private static final String REFRESH_COOKIE_NAME = "refreshToken";
    private final AuthService authService;

    @Value("${jwt.refresh-expiration}")
    private long refreshTokenExpiration;

    @Value("${app.refresh-cookie.secure:false}")
    private boolean refreshCookieSecure;

    @Value("${app.refresh-cookie.same-site:Lax}")
    private String refreshCookieSameSite;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return withRefreshCookie(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return withRefreshCookie(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(name = REFRESH_COOKIE_NAME, required = false) String refreshToken) {
        AuthResponse response = authService.refresh(refreshToken);
        return withRefreshCookie(response);
    }

    // Bu method, kullanıcıların çıkış yapmasını sağlar.
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String authHeader,
                                         @CookieValue(name = REFRESH_COOKIE_NAME, required = false) String refreshToken) {
        logger.info("Logout isteği alındı");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.warn("Geçersiz Authorization header");
            return ResponseEntity.badRequest().body("Geçersiz Authorization header");
        }

        String token = authHeader.substring(7);
        authService.logout(token, refreshToken);
        logger.info("Kullanıcı başarıyla çıkış yaptı");
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildRefreshCookie("", Duration.ZERO).toString())
                .body("Başarıyla çıkış yapıldı");
    }

    private ResponseEntity<AuthResponse> withRefreshCookie(AuthResponse response) {
        String refreshToken = authService.createRefreshToken(response.email());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildRefreshCookie(
                        refreshToken,
                        Duration.ofMillis(refreshTokenExpiration)).toString())
                .body(response);
    }

    private ResponseCookie buildRefreshCookie(String value, Duration maxAge) {
        return ResponseCookie.from(REFRESH_COOKIE_NAME, value)
                .httpOnly(true)
                .secure(refreshCookieSecure)
                .sameSite(refreshCookieSameSite)
                .path("/api/v1/auth")
                .maxAge(maxAge)
                .build();
    }
}
