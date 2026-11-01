package com.nexora.nexora_backend.controller;

import com.nexora.nexora_backend.dto.CourseProgressResponse;
import com.nexora.nexora_backend.dto.LessonProgressRequest;
import com.nexora.nexora_backend.dto.LessonProgressResponse;
import com.nexora.nexora_backend.entity.LessonProgress;
import com.nexora.nexora_backend.service.LessonProgressService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api")
public class LessonProgressController {

    private final LessonProgressService progressService;

    public LessonProgressController(
            LessonProgressService progressService
    ) {
        this.progressService = progressService;
    }

    // PUT: Student marks a lesson completed or incomplete.
    @PutMapping("/lessons/{lessonId}/progress")
    public ResponseEntity<LessonProgressResponse> updateProgress(
            @PathVariable Long lessonId,
            @RequestBody LessonProgressRequest request,
            Authentication authentication
    ) {
        requireStudent(authentication);

        LessonProgress progress = progressService.markLessonProgress(
                lessonId,
                request,
                authentication.getName()
        );

        return ResponseEntity.ok(
                new LessonProgressResponse(progress)
        );
    }

    // GET: Check progress of a specific lesson.
    @GetMapping("/lessons/{lessonId}/progress")
    public ResponseEntity<LessonProgressResponse> getLessonProgress(
            @PathVariable Long lessonId,
            Authentication authentication
    ) {
        requireStudent(authentication);

        boolean completed = progressService.isLessonCompleted(
                lessonId,
                authentication.getName()
        );

        return ResponseEntity.ok(
                new LessonProgressResponse(
                        lessonId,
                        completed,
                        null
                )
        );
    }

    // GET: Get overall progress of an enrolled course.
    @GetMapping("/courses/{courseId}/progress")
    public ResponseEntity<CourseProgressResponse> getCourseProgress(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        requireStudent(authentication);

        CourseProgressResponse response = progressService
                .getCourseProgress(
                        courseId,
                        authentication.getName()
                );

        return ResponseEntity.ok(response);
    }

    private void requireStudent(Authentication authentication) {
        if (authentication == null ||
                !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }

        boolean student = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        "ROLE_STUDENT".equals(authority.getAuthority())
                );

        if (!student) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only students can manage learning progress"
            );
        }
    }
}