
package com.nexora.nexora_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.nexora.nexora_backend.dto.StudentExamQuestionResponse;
import com.nexora.nexora_backend.entity.Exam;
import com.nexora.nexora_backend.entity.ExamQuestion;
import com.nexora.nexora_backend.repository.EnrollmentRepository;
import com.nexora.nexora_backend.repository.ExamQuestionRepository;
import com.nexora.nexora_backend.repository.ExamRepository;

@RestController
@RequestMapping("/api/student/exams")
public class StudentExamController {

    private final ExamRepository examRepository;
    private final ExamQuestionRepository questionRepository;
    private final EnrollmentRepository enrollmentRepository;

    public StudentExamController(
            ExamRepository examRepository,
            ExamQuestionRepository questionRepository,
            EnrollmentRepository enrollmentRepository) {

        this.examRepository = examRepository;
        this.questionRepository = questionRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @GetMapping("/{examId}/questions")
    public ResponseEntity<List<StudentExamQuestionResponse>> getExamQuestions(
            @PathVariable Long examId,
            Authentication authentication) {

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Exam not found"));

        if (!Boolean.TRUE.equals(exam.getPublished())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This exam is not published");
        }

        // Verify that the authenticated student is enrolled
        // in the course associated with this exam.
        boolean enrolled = enrollmentRepository
                .existsByStudent_EmailAndCourse_Id(
                        authentication.getName(),
                        exam.getCourse().getId());

        if (!enrolled) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You must be enrolled in this course to view exam questions");
        }

        List<ExamQuestion> questions =
                questionRepository.findByExam_IdOrderByQuestionOrderAsc(examId);

        List<StudentExamQuestionResponse> response = questions.stream()
                .map(StudentExamQuestionResponse::from)
                .toList();

        return ResponseEntity.ok(response);
    }
}
