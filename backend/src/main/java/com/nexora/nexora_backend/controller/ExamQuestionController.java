
package com.nexora.nexora_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nexora.nexora_backend.dto.ExamQuestionRequest;
import com.nexora.nexora_backend.dto.ExamQuestionResponse;
import com.nexora.nexora_backend.service.ExamQuestionService;

@RestController
@RequestMapping("/api/exams/{examId}/questions")
public class ExamQuestionController {

    private final ExamQuestionService questionService;

    public ExamQuestionController(ExamQuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping
    public ResponseEntity<ExamQuestionResponse> createQuestion(
            @PathVariable Long examId,
            @RequestBody ExamQuestionRequest request) {

        ExamQuestionResponse response =
            questionService.createQuestion(examId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ExamQuestionResponse>> getQuestions(
            @PathVariable Long examId) {

        return ResponseEntity.ok(
            questionService.getQuestionsByExam(examId)
        );
    }

    @GetMapping("/{questionId}")
    public ResponseEntity<ExamQuestionResponse> getQuestion(
            @PathVariable Long examId,
            @PathVariable Long questionId) {

        return ResponseEntity.ok(
            questionService.getQuestionById(examId, questionId)
        );
    }

    @PutMapping("/{questionId}")
    public ResponseEntity<ExamQuestionResponse> updateQuestion(
            @PathVariable Long examId,
            @PathVariable Long questionId,
            @RequestBody ExamQuestionRequest request) {

        return ResponseEntity.ok(
            questionService.updateQuestion(examId, questionId, request)
        );
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> deleteQuestion(
            @PathVariable Long examId,
            @PathVariable Long questionId) {

        questionService.deleteQuestion(examId, questionId);

        return ResponseEntity.noContent().build();
    }
}
