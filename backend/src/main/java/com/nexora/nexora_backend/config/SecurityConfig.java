
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

                // Public endpoints
                .requestMatchers(
                    "/api/health",
                    "/api/auth/register",
                    "/api/auth/login",
                    "/error"
                ).permitAll()

                // Authenticated users can access their own profile
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/users/me"
                ).hasAnyRole("STUDENT", "ADMIN")

                // Only ADMIN can access user-management endpoints
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/users",
                    "/api/users/**"
                ).hasRole("ADMIN")

                // Students and Admins can read courses
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/courses",
                    "/api/courses/**"
                ).hasAnyRole("STUDENT", "ADMIN")

                // Only Admins can create courses
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/courses",
                    "/api/courses/**"
                ).hasRole("ADMIN")

                // Only Admins can update courses
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/courses",
                    "/api/courses/**"
                ).hasRole("ADMIN")

                // Only Admins can partially update courses
                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/courses",
                    "/api/courses/**"
                ).hasRole("ADMIN")

                // Only Admins can delete courses
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/courses",
                    "/api/courses/**"
                ).hasRole("ADMIN")

                // Students and Admins can view their own enrollments
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/enrollments/my"
                ).hasAnyRole("STUDENT", "ADMIN")

                // Only Admins can view all enrollments
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/enrollments"
                ).hasRole("ADMIN")

                // Only Students can enroll in courses
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/enrollments/**"
                ).hasRole("STUDENT")

                // Students can cancel their own enrollments
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/enrollments/**"
                ).hasRole("STUDENT")

                // Students can view published exam questions.
                // Correct answers must not be included in the response.
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/student/exams/*/questions"
                ).hasRole("STUDENT")

                // Students and Admins can request the exam list.
                // The controller must return only published exams to students.
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/exams"
                ).hasAnyRole("STUDENT", "ADMIN")

                // Only Admins can view individual exam details
                // and other exam-specific management endpoints.
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/exams/**"
                ).hasRole("ADMIN")

                // Only Admins can create exams
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/exams",
                    "/api/exams/**"
                ).hasRole("ADMIN")

                // Only Admins can update exams
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/exams",
                    "/api/exams/**"
                ).hasRole("ADMIN")

                // Only Admins can partially update exams
                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/exams",
                    "/api/exams/**"
                ).hasRole("ADMIN")

                // Only Admins can delete exams
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/exams",
                    "/api/exams/**"
                ).hasRole("ADMIN")

                // Only Admins can manage exam questions
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

                // Students can start exams and submit their answers
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/exam-attempts/exams/*/start",
                    "/api/exam-attempts/*/submit"
                ).hasRole("STUDENT")

                // Students can view only their own attempts
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/exam-attempts/my",
                    "/api/exam-attempts/my/**"
                ).hasRole("STUDENT")

                // Only Admins can view all attempts
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/exam-attempts",
                    "/api/exam-attempts/"
                ).hasRole("ADMIN")

                // Only Admins can view a specific attempt
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/exam-attempts/*"
                ).hasRole("ADMIN")

                // All other endpoints require authentication
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
