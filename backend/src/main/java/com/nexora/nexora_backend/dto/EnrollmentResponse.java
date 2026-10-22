
package com.nexora.nexora_backend.dto;

import java.time.LocalDateTime;

import com.nexora.nexora_backend.entity.Enrollment;

public record EnrollmentResponse(
    Long enrollmentId,
    Long studentId,
    String studentName,
    String studentEmail,
    Long courseId,
    String courseTitle,
    String courseDescription,
    String category,
    String instructorName,
    LocalDateTime enrolledAt
) {

    public static EnrollmentResponse from(Enrollment enrollment) {
        return new EnrollmentResponse(
            enrollment.getId(),
            enrollment.getStudent().getId(),
            enrollment.getStudent().getFullName(),
            enrollment.getStudent().getEmail(),
            enrollment.getCourse().getId(),
            enrollment.getCourse().getTitle(),
            enrollment.getCourse().getDescription(),
            enrollment.getCourse().getCategory(),
            enrollment.getCourse().getInstructorName(),
            enrollment.getCreatedAt()
        );
    }
}
