package com.nexora.nexora_backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.nexora.nexora_backend.entity.Course;
import com.nexora.nexora_backend.repository.CourseRepository;

@Service
@Transactional
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Transactional(readOnly = true)
    public List<Course> getCourses(boolean isAdmin) {
        if (isAdmin) {
            return courseRepository.findAllByOrderByCreatedAtDesc();
        }

        return courseRepository.findByPublishedTrueOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Course getCourseById(Long id, boolean isAdmin) {
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Course not found"
            ));

        if (!isAdmin && !Boolean.TRUE.equals(course.getPublished())) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Course not found"
            );
        }

        return course;
    }

    public Course createCourse(
            String title,
            String description,
            String category,
            String instructorName,
            Boolean published) {

        Course course = new Course();

        applyCourseDetails(
            course,
            title,
            description,
            category,
            instructorName,
            published
        );

        return courseRepository.save(course);
    }

    public Course updateCourse(
            Long id,
            String title,
            String description,
            String category,
            String instructorName,
            Boolean published) {

        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Course not found"
            ));

        applyCourseDetails(
            course,
            title,
            description,
            category,
            instructorName,
            published
        );

        return courseRepository.save(course);
    }

    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Course not found"
            ));

        courseRepository.delete(course);
    }

    private void applyCourseDetails(
            Course course,
            String title,
            String description,
            String category,
            String instructorName,
            Boolean published) {

        course.setTitle(requireText(title, "Title", 150));
        course.setDescription(requireText(description, "Description", 2000));
        course.setCategory(requireText(category, "Category", 100));
        course.setInstructorName(
            requireText(instructorName, "Instructor name", 100)
        );

        course.setPublished(published == null ? Boolean.TRUE : published);
    }

    private String requireText(String value, String field, int maxLength) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                field + " is required"
            );
        }

        String trimmed = value.trim();

        if (trimmed.length() > maxLength) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                field + " must not exceed " + maxLength + " characters"
            );
        }

        return trimmed;
    }
}
