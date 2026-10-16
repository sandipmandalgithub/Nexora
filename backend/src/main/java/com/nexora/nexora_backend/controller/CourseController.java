package com.nexora.nexora_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.nexora.nexora_backend.dto.CourseRequest;
import com.nexora.nexora_backend.dto.CourseResponse;
import com.nexora.nexora_backend.entity.Course;
import com.nexora.nexora_backend.service.CourseService;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public List<CourseResponse> getCourses(Authentication authentication) {
        boolean isAdmin = isAdmin(authentication);

        return courseService.getCourses(isAdmin)
            .stream()
            .map(CourseResponse::new)
            .toList();
    }

    @GetMapping("/{id}")
    public CourseResponse getCourseById(
            @PathVariable Long id,
            Authentication authentication) {

        Course course = courseService.getCourseById(
            id,
            isAdmin(authentication)
        );

        return new CourseResponse(course);
    }

    @PostMapping
    public CourseResponse createCourse(
            @RequestBody CourseRequest request,
            Authentication authentication) {

        requireAdmin(authentication);

        Course course = courseService.createCourse(
            request.getTitle(),
            request.getDescription(),
            request.getCategory(),
            request.getInstructorName(),
            request.getPublished()
        );

        return new CourseResponse(course);
    }

    @PutMapping("/{id}")
    public CourseResponse updateCourse(
            @PathVariable Long id,
            @RequestBody CourseRequest request,
            Authentication authentication) {

        requireAdmin(authentication);

        Course course = courseService.updateCourse(
            id,
            request.getTitle(),
            request.getDescription(),
            request.getCategory(),
            request.getInstructorName(),
            request.getPublished()
        );

        return new CourseResponse(course);
    }

    @DeleteMapping("/{id}")
    public void deleteCourse(
            @PathVariable Long id,
            Authentication authentication) {

        requireAdmin(authentication);
        courseService.deleteCourse(id);
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null
            && authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                    "ROLE_ADMIN".equals(authority.getAuthority())
                );
    }

    private void requireAdmin(Authentication authentication) {
        if (!isAdmin(authentication)) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Only administrators can manage courses"
            );
        }
    }
}
