package com.nexora.nexora_backend.dto;

import com.nexora.nexora_backend.entity.ExamQuestion;

public record StudentExamQuestionResponse(
        Long id,
        Long examId,
        String questionText,
        String optionA,
        String optionB,
        String optionC,
        String optionD,
        Integer marks,
        Integer questionOrder) {

    public static StudentExamQuestionResponse from(ExamQuestion question) {
        return new StudentExamQuestionResponse(
                question.getId(),
                question.getExam().getId(),
                question.getQuestionText(),
                question.getOptionA(),
                question.getOptionB(),
                question.getOptionC(),
                question.getOptionD(),
                question.getMarks(),
                question.getQuestionOrder()
        );
    }
}