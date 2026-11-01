package com.nexora.nexora_backend.controller;

import com.nexora.nexora_backend.dto.CourseModuleRequest;
import com.nexora.nexora_backend.dto.CourseModuleResponse;
import com.nexora.nexora_backend.entity.CourseModule;
import com.nexora.nexora_backend.service.CourseModuleService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/modules")
public class CourseModuleController {

    private final CourseModuleService moduleService;

    public CourseModuleController(CourseModuleService moduleService) {
        this.moduleService = moduleService;
    }

    // GET: Enrolled Students and Admins can view modules.
    @GetMapping
    public ResponseEntity<List<CourseModuleResponse>> getModules(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        boolean admin = isAdmin(authentication);

        String email = authentication != null
                ? authentication.getName()
                : null;

        List<CourseModuleResponse> modules = moduleService
                .getModules(courseId, admin, email)
                .stream()
                .map(CourseModuleResponse::new)
                .toList();

        return ResponseEntity.ok(modules);
    }

    // POST: Admin only.
    @PostMapping
    public ResponseEntity<CourseModuleResponse> createModule(
            @PathVariable Long courseId,
            @RequestBody CourseModuleRequest request,
            Authentication authentication
    ) {
        requireAdmin(authentication);

        CourseModule module = moduleService.createModule(
                courseId,
                request,
                true
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new CourseModuleResponse(module));
    }

    // PUT: Admin only.
    @PutMapping("/{moduleId}")
    public ResponseEntity<CourseModuleResponse> updateModule(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @RequestBody CourseModuleRequest request,
            Authentication authentication
    ) {
        requireAdmin(authentication);

        CourseModule module = moduleService.updateModule(
                courseId,
                moduleId,
                request,
                true
        );

        return ResponseEntity.ok(new CourseModuleResponse(module));
    }

    // DELETE: Admin only.
    @DeleteMapping("/{moduleId}")
    public ResponseEntity<Void> deleteModule(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            Authentication authentication
    ) {
        requireAdmin(authentication);

        moduleService.deleteModule(courseId, moduleId, true);

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

    private void requireAdmin(Authentication authentication) {
        if (!isAdmin(authentication)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only administrators can manage course modules"
            );
        }
    }
}