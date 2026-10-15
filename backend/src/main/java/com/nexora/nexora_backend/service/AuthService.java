
package com.nexora.nexora_backend.service;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.nexora.nexora_backend.dto.LoginRequest;
import com.nexora.nexora_backend.dto.UserResponse;
import com.nexora.nexora_backend.entity.User;
import com.nexora.nexora_backend.security.JwtService;

@Service
public class AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserService userService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> login(LoginRequest request) {

        User user = userService.getUserByEmail(request.getEmail())
                .filter(existingUser ->
                        passwordEncoder.matches(
                                request.getPassword(),
                                existingUser.getPassword()
                        )
                )
                .filter(existingUser ->
                        Boolean.TRUE.equals(existingUser.getActive())
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"
                ));

        String token = jwtService.generateToken(user.getEmail());

        return Map.of(
                "message", "Login successful",
                "tokenType", "Bearer",
                "accessToken", token,
                "expiresIn", 86400,
                "user", UserResponse.from(user)
        );
    }
}
