package com.nexora.nexora_backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ExamAttemptReviewResponse(
        Long attemptId,
        String examTitle,
        String status,
        Integer score,
        Integer totalMarks,
        LocalDateTime submittedAt,
        List<ExamQuestionReviewResponse> questions) {
}