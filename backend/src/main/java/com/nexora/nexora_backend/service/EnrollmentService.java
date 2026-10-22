
package com.nexora.nexora_backend.service;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.nexora.nexora_backend.dto.EnrollmentResponse;
import com.nexora.nexora_backend.entity.Course;
import com.nexora.nexora_backend.entity.Enrollment;
import com.nexora.nexora_backend.entity.User;
import com.nexora.nexora_backend.repository.CourseRepository;
import com.nexora.nexora_backend.repository.EnrollmentRepository;

@Service
@Transactional
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserService userService;

    public EnrollmentService(
            EnrollmentRepository enrollmentRepository,
            CourseRepository courseRepository,
            UserService userService) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.userService = userService;
    }

    public EnrollmentResponse enroll(String email, Long courseId) {
        User student = userService.getUserByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Student not found"
            ));

        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Course not found"
            ));

        if (!Boolean.TRUE.equals(course.getPublished())) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Course not found"
            );
        }

        if (enrollmentRepository.existsByStudent_IdAndCourse_Id(
                student.getId(), courseId)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "You are already enrolled in this course"
            );
        }

        Enrollment enrollment = new Enrollment(student, course);

        try {
            return EnrollmentResponse.from(
                enrollmentRepository.saveAndFlush(enrollment)
            );
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "You are already enrolled in this course"
            );
        }
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getMyEnrollments(String email) {
        return enrollmentRepository
            .findByStudent_EmailOrderByCreatedAtDesc(email)
            .stream()
            .map(EnrollmentResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getAllEnrollments() {
        return enrollmentRepository
            .findAllByOrderByCreatedAtDesc()
            .stream()
            .map(EnrollmentResponse::from)
            .toList();
    }

    public void cancelEnrollment(Long enrollmentId, String email) {
        Enrollment enrollment = enrollmentRepository
            .findByIdAndStudent_Email(enrollmentId, email)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Enrollment not found"
            ));

        enrollmentRepository.delete(enrollment);
    }
}
