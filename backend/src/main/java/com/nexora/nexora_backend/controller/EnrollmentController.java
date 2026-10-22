
package com.nexora.nexora_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nexora.nexora_backend.dto.EnrollmentResponse;
import com.nexora.nexora_backend.service.EnrollmentService;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping("/{courseId}")
    public ResponseEntity<EnrollmentResponse> enroll(
            @PathVariable Long courseId,
            Authentication authentication) {

        EnrollmentResponse response = enrollmentService.enroll(
            authentication.getName(),
            courseId
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<EnrollmentResponse>> getMyEnrollments(
            Authentication authentication) {

        return ResponseEntity.ok(
            enrollmentService.getMyEnrollments(authentication.getName())
        );
    }

    @GetMapping
    public ResponseEntity<List<EnrollmentResponse>> getAllEnrollments() {
        return ResponseEntity.ok(
            enrollmentService.getAllEnrollments()
        );
    }

    @DeleteMapping("/{enrollmentId}")
    public ResponseEntity<Void> cancelEnrollment(
            @PathVariable Long enrollmentId,
            Authentication authentication) {

        enrollmentService.cancelEnrollment(
            enrollmentId,
            authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }
}
