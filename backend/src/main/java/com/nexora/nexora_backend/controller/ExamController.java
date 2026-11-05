
package com.nexora.nexora_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.nexora.nexora_backend.dto.ExamRequest;
import com.nexora.nexora_backend.dto.ExamResponse;
import com.nexora.nexora_backend.service.ExamService;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @GetMapping
    public List<ExamResponse> getAllExams(Authentication authentication) {

        if (isAdmin(authentication)) {
            return examService.getAllExams();
        }

        return examService.getPublishedExamsForStudent(
            authentication.getName()
        );
    }

    @GetMapping("/course/{courseId}")
    public List<ExamResponse> getExamsByCourse(
            @PathVariable Long courseId,
            Authentication authentication) {

        if (isAdmin(authentication)) {
            return examService.getExamsByCourse(courseId);
        }

        return examService.getPublishedExamsByCourseForStudent(
            courseId,
            authentication.getName()
        );
    }

    @GetMapping("/{id}")
    public ExamResponse getExamById(
            @PathVariable Long id,
            Authentication authentication) {

        if (isAdmin(authentication)) {
            return examService.getExamById(id);
        }

        return examService.getExamByIdForStudent(
            id,
            authentication.getName()
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExamResponse createExam(@RequestBody ExamRequest request) {
        return examService.createExam(request);
    }

    @PutMapping("/{id}")
    public ExamResponse updateExam(
            @PathVariable Long id,
            @RequestBody ExamRequest request) {
        return examService.updateExam(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null
            && authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                    authority.getAuthority().equals("ROLE_ADMIN")
                );
    }
}
