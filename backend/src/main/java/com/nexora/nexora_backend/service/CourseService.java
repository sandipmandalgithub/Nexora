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
            return courseRepository.findByArchivedFalseOrderByCreatedAtDesc();
        }

        return courseRepository
            .findByPublishedTrueAndArchivedFalseOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<Course> getArchivedCourses() {
        return courseRepository.findByArchivedTrueOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Course getCourseById(Long id, boolean isAdmin) {

        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Course not found"
            ));

        if (Boolean.TRUE.equals(course.getArchived())) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Course not found"
            );
        }

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

        course.setArchived(false);

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

        if (Boolean.TRUE.equals(course.getArchived())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Archived courses cannot be updated. Restore the course first."
            );
        }

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

        course.setArchived(true);

        courseRepository.save(course);
    }

    public Course restoreCourse(Long id) {

        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Course not found"
            ));

        if (!Boolean.TRUE.equals(course.getArchived())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Course is not archived"
            );
        }

        course.setArchived(false);

        return courseRepository.save(course);
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