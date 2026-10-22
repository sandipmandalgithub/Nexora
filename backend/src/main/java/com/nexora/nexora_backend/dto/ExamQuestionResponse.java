
package com.nexora.nexora_backend.dto;

import java.time.LocalDateTime;

import com.nexora.nexora_backend.entity.ExamQuestion;

public record ExamQuestionResponse(
        Long id,
        Long examId,
        String questionText,
        String optionA,
        String optionB,
        String optionC,
        String optionD,
        String correctOption,
        Integer marks,
        Integer questionOrder,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static ExamQuestionResponse from(ExamQuestion question) {
        return new ExamQuestionResponse(
            question.getId(),
            question.getExam().getId(),
            question.getQuestionText(),
            question.getOptionA(),
            question.getOptionB(),
            question.getOptionC(),
            question.getOptionD(),
            question.getCorrectOption(),
            question.getMarks(),
            question.getQuestionOrder(),
            question.getCreatedAt(),
            question.getUpdatedAt()
        );
    }
}
