package com.mobivisor.mobivisortechnicalinfoportal.dto.mapper;

import com.mobivisor.mobivisortechnicalinfoportal.dto.request.UserCreateRequest;
import com.mobivisor.mobivisortechnicalinfoportal.dto.request.UserUpdateRequest;
import com.mobivisor.mobivisortechnicalinfoportal.dto.response.UserResponse;
import com.mobivisor.mobivisortechnicalinfoportal.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(UserCreateRequest request) {
        User user = new User();
        user.setEmail(request.email());
        user.setUserName(request.username());
        user.setRole(request.role());
        return user;
    }

    public void updateEntity(User user, UserUpdateRequest request) {
        user.setEmail(request.email());
        user.setUserName(request.username());
        user.setRole(request.role());
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getUserId(),
                user.getEmail(),
                user.getUserName(),
                user.getRole()
        );
    }
}
