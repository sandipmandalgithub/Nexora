
package com.nexora.nexora_backend.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.nexora.nexora_backend.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth

                // Public endpoints
                .requestMatchers(
                    "/api/health",
                    "/api/auth/register",
                    "/api/auth/login",
                    "/error"
                ).permitAll()

                // Public certificate verification
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/certificates/verify",
                    "/api/certificates/verify/**"
                ).permitAll()

                // User endpoints
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/users/me"
                ).hasAnyRole("STUDENT", "ADMIN")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/users/**"
                ).hasRole("ADMIN")

                // Course read access
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/courses",
                    "/api/courses/**"
                ).permitAll()

                // Course management - Admin only
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/courses",
                    "/api/courses/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/courses/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/courses/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/courses/**"
                ).hasRole("ADMIN")

                // Enrollment endpoints
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/enrollments/my",
                    "/api/enrollments/my/**"
                ).hasAnyRole("STUDENT", "ADMIN")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/enrollments",
                    "/api/enrollments/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/enrollments",
                    "/api/enrollments/**"
                ).hasRole("STUDENT")

                // Admin enrollment deletion - must be before Student matcher
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/enrollments/admin/**"
                ).hasRole("ADMIN")

                // Student can delete only their own enrollment
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/enrollments/**"
                ).hasRole("STUDENT")

                // Student exam questions
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/student/exams/*/questions"
                ).hasRole("STUDENT")

                // Exam read access
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/exams",
                    "/api/exams/course/*"
                ).hasAnyRole("STUDENT", "ADMIN")

                // Other exam read access - Admin only
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/exams/**"
                ).hasRole("ADMIN")

                // Exam management - Admin only
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/exams",
                    "/api/exams/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/exams/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/exams/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/exams/**"
                ).hasRole("ADMIN")

                // Exam question management - Admin only
                .requestMatchers(
                    "/api/exam-questions/**"
                ).hasRole("ADMIN")

                // Exam attempt start and submit - Student only
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/exam-attempts/exams/*/start",
                    "/api/exam-attempts/*/submit"
                ).hasRole("STUDENT")

                // Student's own exam attempts
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/exam-attempts/my",
                    "/api/exam-attempts/my/**"
                ).hasRole("STUDENT")

                // Admin exam attempt access
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/exam-attempts",
                    "/api/exam-attempts/",
                    "/api/exam-attempts/admin/**",
                    "/api/exam-attempts/*"
                ).hasRole("ADMIN")

                // Grade Cards - Student's own records
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/grade-cards/my",
                    "/api/grade-cards/my/**"
                ).hasRole("STUDENT")

                // Grade Cards - Admin access
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/grade-cards",
                    "/api/grade-cards/",
                    "/api/grade-cards/**"
                ).hasRole("ADMIN")

                // Certificates - Student's own records
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/certificates/my",
                    "/api/certificates/my/**"
                ).hasRole("STUDENT")

                // Certificates - Admin access
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/certificates",
                    "/api/certificates/",
                    "/api/certificates/**"
                ).hasRole("ADMIN")

                // All remaining requests require authentication
                .anyRequest().authenticated()
            );

        http.addFilterBefore(
            jwtAuthenticationFilter,
            UsernamePasswordAuthenticationFilter.class
        );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
            Arrays.stream(
                System.getenv().getOrDefault(
                    "FRONTEND_URL",
                    "http://localhost:5173"
                ).split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList()
        );

        configuration.setAllowedMethods(
            List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        );

        configuration.setAllowedHeaders(
            List.of("Authorization", "Content-Type")
        );

        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
