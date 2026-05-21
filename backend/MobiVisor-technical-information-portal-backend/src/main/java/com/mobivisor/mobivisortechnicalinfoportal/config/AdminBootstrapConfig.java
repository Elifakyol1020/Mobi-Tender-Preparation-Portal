package com.mobivisor.mobivisortechnicalinfoportal.config;

import com.mobivisor.mobivisortechnicalinfoportal.entity.User;
import com.mobivisor.mobivisortechnicalinfoportal.enumarate.Role;
import com.mobivisor.mobivisortechnicalinfoportal.repository.jpa.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminBootstrapConfig {

    @Bean
    public ApplicationRunner bootstrapAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.email:}") String adminEmail,
            @Value("${app.admin.username:Admin}") String adminUsername,
            @Value("${app.admin.password:}") String adminPassword) {
        return args -> {
            if (adminEmail.isBlank() || adminPassword.isBlank()) {
                return;
            }

            String normalizedEmail = adminEmail.trim().toLowerCase();
            User admin = userRepository.findByEmail(normalizedEmail)
                    .orElseGet(User::new);

            admin.setEmail(normalizedEmail);
            admin.setUserName(adminUsername);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
        };
    }
}
