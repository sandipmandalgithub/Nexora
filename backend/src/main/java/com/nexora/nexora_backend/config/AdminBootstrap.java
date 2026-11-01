
package com.nexora.nexora_backend.config;

import java.util.Optional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.nexora.nexora_backend.entity.User;
import com.nexora.nexora_backend.service.UserService;

@Component
public class AdminBootstrap implements CommandLineRunner {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public AdminBootstrap(
            UserService userService,
            PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        if (!"true".equalsIgnoreCase(
                System.getenv("ADMIN_BOOTSTRAP_ENABLED"))) {
            return;
        }

        String name = System.getenv("ADMIN_BOOTSTRAP_NAME");
        String email = System.getenv("ADMIN_BOOTSTRAP_EMAIL");
        String password = System.getenv("ADMIN_BOOTSTRAP_PASSWORD");

        if (name == null || name.isBlank()
                || email == null || email.isBlank()
                || password == null || password.isBlank()) {
            throw new IllegalStateException(
                    "Admin bootstrap environment variables are missing"
            );
        }

        String normalizedEmail = email.trim().toLowerCase();

        Optional<User> existingUser =
                userService.getUserByEmail(normalizedEmail);

        if (existingUser.isPresent()) {

            if (!"ADMIN".equalsIgnoreCase(
                    existingUser.get().getRole())) {
                throw new IllegalStateException(
                        "This email already belongs to a non-admin user"
                );
            }

            System.out.println("Nexora Admin already exists.");
            return;
        }

        User admin = new User(
                name.trim(),
                normalizedEmail,
                passwordEncoder.encode(password)
        );

        admin.setRole("ADMIN");
        admin.setActive(true);

        userService.saveUser(admin);

        System.out.println("Nexora Production Admin created successfully.");
    }
}
