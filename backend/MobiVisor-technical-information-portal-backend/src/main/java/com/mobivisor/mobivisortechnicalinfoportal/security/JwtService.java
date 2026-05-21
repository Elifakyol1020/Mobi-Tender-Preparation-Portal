package com.mobivisor.mobivisortechnicalinfoportal.security;

import com.mobivisor.mobivisortechnicalinfoportal.enumarate.Role;
import com.mobivisor.mobivisortechnicalinfoportal.exception.TokenExpiredException;
import com.mobivisor.mobivisortechnicalinfoportal.exception.UnauthorizedException;
import com.mobivisor.mobivisortechnicalinfoportal.repository.jpa.BlacklistTokenRepository;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret-key}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long accessTokenExpirationTime;

    @Value("${jwt.refresh-expiration}")
    private long refreshTokenExpirationTime;

    private final BlacklistTokenRepository blacklistTokenRepository;

    public JwtService(BlacklistTokenRepository blacklistTokenRepository) {
        this.blacklistTokenRepository = blacklistTokenRepository;
    }

    public String generateAccessToken(String email, Role role) {
        return generateToken(email, role, "access", accessTokenExpirationTime);
    }

    public String generateRefreshToken(String email, Role role) {
        return generateToken(email, role, "refresh", refreshTokenExpirationTime);
    }

    private String generateToken(String email, Role role, String tokenType, long expirationTime) {
        if (role == null) {
            throw new IllegalArgumentException("Rol null olamaz");
        }
        SecretKey key = getSignKey();
        return Jwts.builder()
                .setSubject(email)
                .claim("role", "ROLE_" + role.name())
                .claim("tokenType", tokenType)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(key,SignatureAlgorithm.HS256)
                .compact();
    }

    public long getAccessTokenExpirationTime() {
        return accessTokenExpirationTime;
    }

    public long getRefreshTokenExpirationTime() {
        return refreshTokenExpirationTime;
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("tokenType", String.class));
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Claims getClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSignKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            throw new TokenExpiredException("Token süresi dolmuş", e.getMessage());
        } catch (Exception e) {
            throw new UnauthorizedException("Geçersiz token", e.getMessage());
        }
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        final Claims claims = getClaims(token);
        return resolver.apply(claims);
    }

    public void validateToken(String token) {
        if (blacklistTokenRepository.existsByToken(token)) {
            throw new UnauthorizedException("Bu token kara listeye alınmış.");
        }
        if (isTokenExpired(token)) {
            throw new TokenExpiredException("Token süresi dolmuş.");
        }
    }

    public void validateAccessToken(String token) {
        validateToken(token);
        if (!"access".equals(extractTokenType(token))) {
            throw new UnauthorizedException("Access token bekleniyor.");
        }
    }

    public void validateRefreshToken(String token) {
        validateToken(token);
        if (!"refresh".equals(extractTokenType(token))) {
            throw new UnauthorizedException("Refresh token bekleniyor.");
        }
    }

    private SecretKey getSignKey() {
        byte[] decodedKey = Base64.getDecoder().decode(secretKey);
        return Keys.hmacShaKeyFor(decodedKey);
    }
}
