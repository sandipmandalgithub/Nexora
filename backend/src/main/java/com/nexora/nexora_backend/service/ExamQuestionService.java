
package com.nexora.nexora_backend.service;

import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.nexora.nexora_backend.dto.ExamQuestionRequest;
import com.nexora.nexora_backend.dto.ExamQuestionResponse;
import com.nexora.nexora_backend.entity.Exam;
import com.nexora.nexora_backend.entity.ExamQuestion;
import com.nexora.nexora_backend.repository.ExamQuestionRepository;
import com.nexora.nexora_backend.repository.ExamRepository;

@Service
@Transactional
public class ExamQuestionService {

    private final ExamQuestionRepository questionRepository;
    private final ExamRepository examRepository;

    public ExamQuestionService(
            ExamQuestionRepository questionRepository,
            ExamRepository examRepository) {
        this.questionRepository = questionRepository;
        this.examRepository = examRepository;
    }

    public ExamQuestionResponse createQuestion(
            Long examId,
            ExamQuestionRequest request) {

        Exam exam = findExam(examId);
        ExamQuestion question = new ExamQuestion();

        question.setExam(exam);
        applyRequest(question, request);

        return ExamQuestionResponse.from(
            questionRepository.save(question)
        );
    }

    @Transactional(readOnly = true)
    public List<ExamQuestionResponse> getQuestionsByExam(Long examId) {
        findExam(examId);

        return questionRepository
            .findByExam_IdOrderByQuestionOrderAsc(examId)
            .stream()
            .map(ExamQuestionResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public ExamQuestionResponse getQuestionById(
            Long examId,
            Long questionId) {

        return ExamQuestionResponse.from(
            findQuestion(examId, questionId)
        );
    }

    public ExamQuestionResponse updateQuestion(
            Long examId,
            Long questionId,
            ExamQuestionRequest request) {

        ExamQuestion question = findQuestion(examId, questionId);
        applyRequest(question, request);

        return ExamQuestionResponse.from(
            questionRepository.save(question)
        );
    }

    public void deleteQuestion(Long examId, Long questionId) {
        ExamQuestion question = findQuestion(examId, questionId);
        questionRepository.delete(question);
    }

    private Exam findExam(Long examId) {
        return examRepository.findById(examId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Exam not found"
            ));
    }

    private ExamQuestion findQuestion(Long examId, Long questionId) {
        ExamQuestion question = questionRepository.findById(questionId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Question not found"
            ));

        if (!question.getExam().getId().equals(examId)) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Question not found for this exam"
            );
        }

        return question;
    }

    private void applyRequest(
            ExamQuestion question,
            ExamQuestionRequest request) {

        if (request == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Question details are required"
            );
        }

        String questionText = validateText(
            request.getQuestionText(), "Question text", 2000
        );
        String optionA = validateText(request.getOptionA(), "Option A", 500);
        String optionB = validateText(request.getOptionB(), "Option B", 500);
        String optionC = validateText(request.getOptionC(), "Option C", 500);
        String optionD = validateText(request.getOptionD(), "Option D", 500);

        if (request.getCorrectOption() == null
                || request.getCorrectOption().isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Correct option is required"
            );
        }

        String correctOption = request.getCorrectOption()
            .trim()
            .toUpperCase(Locale.ROOT);

        if (!List.of("A", "B", "C", "D").contains(correctOption)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Correct option must be A, B, C, or D"
            );
        }

        if (request.getMarks() == null
                || request.getMarks() < 1
                || request.getMarks() > 100) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Question marks must be between 1 and 100"
            );
        }

        if (request.getQuestionOrder() == null
                || request.getQuestionOrder() < 1) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Question order must be at least 1"
            );
        }

        question.setQuestionText(questionText);
        question.setOptionA(optionA);
        question.setOptionB(optionB);
        question.setOptionC(optionC);
        question.setOptionD(optionD);
        question.setCorrectOption(correctOption);
        question.setMarks(request.getMarks());
        question.setQuestionOrder(request.getQuestionOrder());
    }

    private String validateText(
            String value,
            String fieldName,
            int maxLength) {

        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                fieldName + " is required"
            );
        }

        String trimmed = value.trim();

        if (trimmed.length() > maxLength) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                fieldName + " must not exceed " + maxLength + " characters"
            );
        }

        return trimmed;
    }
}
