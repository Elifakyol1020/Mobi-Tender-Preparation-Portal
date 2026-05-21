package com.mobivisor.mobivisortechnicalinfoportal.service;

import com.mobivisor.mobivisortechnicalinfoportal.dto.mapper.UserMapper;
import com.mobivisor.mobivisortechnicalinfoportal.dto.request.UserCreateRequest;
import com.mobivisor.mobivisortechnicalinfoportal.dto.request.UserUpdateRequest;
import com.mobivisor.mobivisortechnicalinfoportal.dto.response.UserResponse;
import com.mobivisor.mobivisortechnicalinfoportal.entity.User;
import com.mobivisor.mobivisortechnicalinfoportal.repository.jpa.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    public UserService(UserRepository userRepository,
                       UserMapper userMapper,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse createUser(UserCreateRequest request) {
        logger.info("Yeni kullanıcı oluşturuluyor: {}", request.email());
        if (request.email() == null || request.email().isBlank()) {
            throw new IllegalArgumentException("Email zorunlu");
        }
        if (request.username() == null || request.username().isBlank()) {
            throw new IllegalArgumentException("Kullanıcı adı zorunlu");
        }
        if (request.password() == null || request.password().length() < 6) {
            throw new IllegalArgumentException("Şifre en az 6 karakter olmalı");
        }
        if (request.role() == null) {
            throw new IllegalArgumentException("Rol zorunlu");
        }

        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            logger.warn("Email zaten kullanımda: {}", email);
            throw new IllegalArgumentException("Email zaten kayıtlı");
        }

        User user = userMapper.toEntity(request);
        user.setEmail(email);
        user.setUserName(request.username().trim());
        user.setPassword(passwordEncoder.encode(request.password()));
        User savedUser = userRepository.save(user);
        logger.info("Kullanıcı başarıyla oluşturuldu: {}", savedUser.getUserId());
        return userMapper.toResponse(savedUser);
    }

    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        logger.info("Kullanıcı güncelleniyor: id={}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı"));

        if (!user.getEmail().equals(request.email()) && userRepository.existsByEmail(request.email())) {
            logger.warn("Email başka kullanıcı tarafından kullanılıyor: {}", request.email());
            throw new IllegalArgumentException("Email zaten kayıtlı");
        }

        userMapper.updateEntity(user, request);
        User updated = userRepository.save(user);
        logger.info("Kullanıcı güncellendi: id={}", updated.getUserId());
        return userMapper.toResponse(updated);
    }

    public List<UserResponse> getAllUsers() {
        logger.info("Tüm kullanıcılar getiriliyor");
        return userRepository.findAll()
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }

    public UserResponse getUserById(Long userId) {
        logger.info("Kullanıcı getiriliyor: id={}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı"));
        return userMapper.toResponse(user);
    }

    public User getUserByEmail(String email) {
        logger.info("Kullanıcı email ile aranıyor: {}", email);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı"));
    }

    public void deleteUser(Long userId) {
        logger.info("Kullanıcı siliniyor: id={}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı"));
        userRepository.delete(user);
        logger.info("Kullanıcı silindi: id={}", userId);
    }
}
