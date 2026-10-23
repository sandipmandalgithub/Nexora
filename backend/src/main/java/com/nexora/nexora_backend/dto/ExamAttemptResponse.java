
package com.nexora.nexora_backend.dto;

import java.time.LocalDateTime;

import com.nexora.nexora_backend.entity.ExamAttempt;
import com.nexora.nexora_backend.entity.ExamAttempt.AttemptStatus;

public record ExamAttemptResponse(
        Long id,
        Long examId,
        String examTitle,
        Long studentId,
        String studentName,
        AttemptStatus status,
        Integer score,
        Integer totalMarks,
        LocalDateTime startedAt,
        LocalDateTime submittedAt,
        LocalDateTime updatedAt) {

    public static ExamAttemptResponse from(ExamAttempt attempt) {
        return new ExamAttemptResponse(
                attempt.getId(),
                attempt.getExam().getId(),
                attempt.getExam().getTitle(),
                attempt.getStudent().getId(),
                attempt.getStudent().getFullName(),
                attempt.getStatus(),
                attempt.getScore(),
                attempt.getTotalMarks(),
                attempt.getStartedAt(),
                attempt.getSubmittedAt(),
                attempt.getUpdatedAt()
        );
    }
}
