package com.nexora.nexora_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nexora.nexora_backend.dto.ExamAttemptResponse;
import com.nexora.nexora_backend.dto.ExamSubmissionRequest;
import com.nexora.nexora_backend.dto.StudentExamAnalyticsResponse;
import com.nexora.nexora_backend.service.ExamAttemptService;

@RestController
@RequestMapping("/api/exam-attempts")
public class ExamAttemptController {

    private final ExamAttemptService attemptService;

    public ExamAttemptController(ExamAttemptService attemptService) {
        this.attemptService = attemptService;
    }

    @PostMapping("/exams/{examId}/start")
    public ResponseEntity<ExamAttemptResponse> startAttempt(
            @PathVariable Long examId,
            Authentication authentication) {

        ExamAttemptResponse response = attemptService.startAttempt(
                examId,
                authentication.getName()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ExamAttemptResponse>> getMyAttempts(
            Authentication authentication) {

        return ResponseEntity.ok(
                attemptService.getMyAttempts(authentication.getName())
        );
    }

    @GetMapping("/my/analytics")
    public ResponseEntity<StudentExamAnalyticsResponse> getMyAnalytics(
            Authentication authentication) {

        return ResponseEntity.ok(
                attemptService.getMyAnalytics(authentication.getName())
        );
    }

    @GetMapping("/my/{attemptId}")
    public ResponseEntity<ExamAttemptResponse> getMyAttempt(
            @PathVariable Long attemptId,
            Authentication authentication) {

        return ResponseEntity.ok(
                attemptService.getMyAttempt(
                        attemptId,
                        authentication.getName()
                )
        );
    }

    @PostMapping("/{attemptId}/submit")
    public ResponseEntity<ExamAttemptResponse> submitAttempt(
            @PathVariable Long attemptId,
            @RequestBody ExamSubmissionRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                attemptService.submitAttempt(
                        attemptId,
                        authentication.getName(),
                        request
                )
        );
    }

    @GetMapping
    public ResponseEntity<List<ExamAttemptResponse>> getAllAttempts() {
        return ResponseEntity.ok(attemptService.getAllAttempts());
    }

    @GetMapping("/{attemptId}")
    public ResponseEntity<ExamAttemptResponse> getAttemptById(
            @PathVariable Long attemptId) {

        return ResponseEntity.ok(
                attemptService.getAttemptById(attemptId)
        );
    }
}
