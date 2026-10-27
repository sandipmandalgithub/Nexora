
package com.nexora.nexora_backend.config;

import com.nexora.nexora_backend.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter)
            throws Exception {

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth

                .requestMatchers(
                    "/api/health",
                    "/api/auth/register",
                    "/api/auth/login",
                    "/error"
                ).permitAll()

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/users/me"
                ).hasAnyRole("STUDENT", "ADMIN")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/users",
                    "/api/users/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/courses",
                    "/api/courses/**"
                ).hasAnyRole("STUDENT", "ADMIN")

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/courses",
                    "/api/courses/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/courses",
                    "/api/courses/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/courses",
                    "/api/courses/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/courses",
                    "/api/courses/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/enrollments/my"
                ).hasAnyRole("STUDENT", "ADMIN")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/enrollments"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/enrollments/**"
                ).hasRole("STUDENT")

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/enrollments/**"
                ).hasRole("STUDENT")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/student/exams/*/questions"
                ).hasRole("STUDENT")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/exams"
                ).hasAnyRole("STUDENT", "ADMIN")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/exams/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/exams",
                    "/api/exams/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/exams",
                    "/api/exams/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/exams",
                    "/api/exams/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/exams",
                    "/api/exams/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/exams/*/questions",
                    "/api/exams/*/questions/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/exams/*/questions",
                    "/api/exams/*/questions/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/exams/*/questions",
                    "/api/exams/*/questions/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/exams/*/questions",
                    "/api/exams/*/questions/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/exams/*/questions",
                    "/api/exams/*/questions/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/exam-attempts/exams/*/start",
                    "/api/exam-attempts/*/submit"
                ).hasRole("STUDENT")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/exam-attempts/my",
                    "/api/exam-attempts/my/**"
                ).hasRole("STUDENT")

                // Admin report endpoints must be matched before /{attemptId}.
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/exam-attempts/admin/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/exam-attempts",
                    "/api/exam-attempts/"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/exam-attempts/*"
                ).hasRole("ADMIN")

                .anyRequest().authenticated()
            )
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
            List.of("http://localhost:5173")
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
