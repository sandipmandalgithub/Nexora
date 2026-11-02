package com.nexora.nexora_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.nexora.nexora_backend.dto.ModuleRequest;
import com.nexora.nexora_backend.dto.ModuleResponse;
import com.nexora.nexora_backend.entity.CourseModule;
import com.nexora.nexora_backend.service.ModuleService;

@RestController
@RequestMapping("/api/courses/{courseId}/modules")
public class ModuleController {

    private final ModuleService moduleService;

    public ModuleController(ModuleService moduleService) {
        this.moduleService = moduleService;
    }

    // GET: Admin and enrolled students can view modules.
    @GetMapping
    public ResponseEntity<List<ModuleResponse>> getModules(
            @PathVariable Long courseId,
            Authentication authentication) {

        boolean isAdmin = isAdmin(authentication);

        List<CourseModule> modules = moduleService.getModules(
                courseId,
                isAdmin,
                authentication.getName()
        );

        List<ModuleResponse> response = modules.stream()
                .map(ModuleResponse::new)
                .toList();

        return ResponseEntity.ok(response);
    }

    // POST: Admin only.
    @PostMapping
    public ResponseEntity<ModuleResponse> createModule(
            @PathVariable Long courseId,
            @RequestBody ModuleRequest request,
            Authentication authentication) {

        requireAdmin(authentication);

        CourseModule module = moduleService.createModule(
                courseId,
                request
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new ModuleResponse(module));
    }

    // PUT: Admin only.
    @PutMapping("/{moduleId}")
    public ResponseEntity<ModuleResponse> updateModule(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @RequestBody ModuleRequest request,
            Authentication authentication) {

        requireAdmin(authentication);

        CourseModule module = moduleService.updateModule(
                courseId,
                moduleId,
                request
        );

        return ResponseEntity.ok(new ModuleResponse(module));
    }

    // DELETE: Admin only.
    @DeleteMapping("/{moduleId}")
    public ResponseEntity<Void> deleteModule(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            Authentication authentication) {

        requireAdmin(authentication);

        moduleService.deleteModule(courseId, moduleId);

        return ResponseEntity.noContent().build();
    }

    private boolean isAdmin(Authentication authentication) {

        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        "ROLE_ADMIN".equals(authority.getAuthority())
                );
    }

    private void requireAdmin(Authentication authentication) {

        if (!isAdmin(authentication)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Admin access required"
            );
        }
    }
}