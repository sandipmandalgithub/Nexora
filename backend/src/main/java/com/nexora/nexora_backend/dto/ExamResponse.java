
package com.nexora.nexora_backend.dto;

import java.time.LocalDateTime;

import com.nexora.nexora_backend.entity.Exam;

public record ExamResponse(
    Long id,
    String title,
    String description,
    Long courseId,
    String courseTitle,
    Integer durationMinutes,
    Boolean published,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {

    public static ExamResponse from(Exam exam) {
        return new ExamResponse(
            exam.getId(),
            exam.getTitle(),
            exam.getDescription(),
            exam.getCourse().getId(),
            exam.getCourse().getTitle(),
            exam.getDurationMinutes(),
            exam.getPublished(),
            exam.getCreatedAt(),
            exam.getUpdatedAt()
        );
    }
}
