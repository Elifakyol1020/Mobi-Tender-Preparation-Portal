package com.mobivisor.mobivisortechnicalinfoportal.security;

import com.mobivisor.mobivisortechnicalinfoportal.exception.TokenExpiredException;
import com.mobivisor.mobivisortechnicalinfoportal.exception.UnauthorizedException;
import com.mobivisor.mobivisortechnicalinfoportal.service.AuthenticationLogService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final AuthenticationLogService logService;

    private final ThreadLocal<Boolean> logged = ThreadLocal.withInitial(() -> false);

    public JwtAuthenticationFilter(JwtService jwtService, AuthenticationLogService logService) {
        this.jwtService = jwtService;
        this.logService = logService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String token;
        final String username;
        final String role;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        token = authHeader.substring(7);

        try {
            jwtService.validateAccessToken(token);
            username = jwtService.extractUsername(token);
            role = jwtService.extractRole(token);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role);

                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(
                                username,
                                null,
                                Collections.singletonList(authority)
                        );

                SecurityContextHolder.getContext().setAuthentication(authenticationToken);

                if (!logged.get()) {
                    String ipAddress = request.getRemoteAddr();
                    logService.logAuthentication(username, role, ipAddress);
                    logged.set(true); 
                }

                logger.info("Kullanıcı '{}' başarıyla doğrulandı, rol: {}", username, role);
            }

        } catch (TokenExpiredException ex) {
            logger.warn("Token süresi dolmuş: {}", ex.getMessage());
            SecurityContextHolder.clearContext();
        } catch (UnauthorizedException ex) {
            logger.warn("Yetkisiz token: {}", ex.getMessage());
            SecurityContextHolder.clearContext();
        } catch (Exception ex) {
            logger.error("JWT işlenirken hata oluştu: {}", ex.getMessage(), ex);
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
        logged.remove();
    }
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.equals("/favicon.ico") || "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

}
