package com.nexora.nexora_backend.dto;

public record ExamQuestionReviewResponse(
        Long questionId,
        Integer questionOrder,
        String questionText,
        String optionA,
        String optionB,
        String optionC,
        String optionD,
        String selectedOption,
        String selectedAnswer,
        String correctOption,
        String correctAnswer,
        String result,
        Integer marks,
        Integer awardedMarks) {
}