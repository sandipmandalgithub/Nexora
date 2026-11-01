package com.nexora.nexora_backend.controller;

import com.nexora.nexora_backend.dto.LessonRequest;
import com.nexora.nexora_backend.dto.LessonResponse;
import com.nexora.nexora_backend.entity.Lesson;
import com.nexora.nexora_backend.service.LessonService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/modules/{moduleId}/lessons")
public class LessonController {

    private final LessonService lessonService;

    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    // GET: Enrolled Students and Admins can view lessons.
    @GetMapping
    public ResponseEntity<List<LessonResponse>> getLessons(
            @PathVariable Long moduleId,
            Authentication authentication
    ) {
        requireAuthenticated(authentication);

        boolean admin = isAdmin(authentication);
        String email = authentication.getName();

        List<LessonResponse> lessons = lessonService
                .getLessons(moduleId, admin, email)
                .stream()
                .map(LessonResponse::new)
                .toList();

        return ResponseEntity.ok(lessons);
    }

    // POST: Admin only.
    @PostMapping
    public ResponseEntity<LessonResponse> createLesson(
            @PathVariable Long moduleId,
            @RequestBody LessonRequest request,
            Authentication authentication
    ) {
        requireAdmin(authentication);

        Lesson lesson = lessonService.createLesson(moduleId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new LessonResponse(lesson));
    }

    // PUT: Admin only.
    @PutMapping("/{lessonId}")
    public ResponseEntity<LessonResponse> updateLesson(
            @PathVariable Long moduleId,
            @PathVariable Long lessonId,
            @RequestBody LessonRequest request,
            Authentication authentication
    ) {
        requireAdmin(authentication);

        Lesson lesson = lessonService.updateLesson(
                moduleId,
                lessonId,
                request
        );

        return ResponseEntity.ok(new LessonResponse(lesson));
    }

    // DELETE: Admin only.
    @DeleteMapping("/{lessonId}")
    public ResponseEntity<Void> deleteLesson(
            @PathVariable Long moduleId,
            @PathVariable Long lessonId,
            Authentication authentication
    ) {
        requireAdmin(authentication);

        lessonService.deleteLesson(moduleId, lessonId);

        return ResponseEntity.noContent().build();
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null &&
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                "ROLE_ADMIN".equals(authority.getAuthority())
                        );
    }

    private void requireAuthenticated(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }
    }

    private void requireAdmin(Authentication authentication) {
        if (!isAdmin(authentication)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only administrators can manage lessons"
            );
        }
    }
}