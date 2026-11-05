
package com.nexora.nexora_backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.nexora.nexora_backend.dto.ExamRequest;
import com.nexora.nexora_backend.dto.ExamResponse;
import com.nexora.nexora_backend.entity.Course;
import com.nexora.nexora_backend.entity.Exam;
import com.nexora.nexora_backend.repository.CourseRepository;
import com.nexora.nexora_backend.repository.EnrollmentRepository;
import com.nexora.nexora_backend.repository.ExamRepository;

@Service
@Transactional
public class ExamService {

    private final ExamRepository examRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public ExamService(
            ExamRepository examRepository,
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository) {
        this.examRepository = examRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public ExamResponse createExam(ExamRequest request) {
        Exam exam = new Exam();

        applyRequest(exam, request);

        return ExamResponse.from(examRepository.save(exam));
    }

    @Transactional(readOnly = true)
    public List<ExamResponse> getAllExams() {
        return examRepository.findAllByOrderByCreatedAtDesc()
            .stream()
            .map(ExamResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ExamResponse> getPublishedExams() {
        return examRepository.findByPublishedTrueOrderByCreatedAtDesc()
            .stream()
            .map(ExamResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ExamResponse> getPublishedExamsForStudent(String email) {

        List<Long> courseIds = enrollmentRepository
            .findByStudent_EmailOrderByCreatedAtDesc(email)
            .stream()
            .map(enrollment -> enrollment.getCourse().getId())
            .distinct()
            .toList();

        if (courseIds.isEmpty()) {
            return List.of();
        }

        return examRepository
            .findByPublishedTrueAndCourse_IdInOrderByCreatedAtDesc(courseIds)
            .stream()
            .map(ExamResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ExamResponse> getExamsByCourse(Long courseId) {

        if (!courseRepository.existsById(courseId)) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Course not found"
            );
        }

        return examRepository
            .findByCourse_IdOrderByCreatedAtDesc(courseId)
            .stream()
            .map(ExamResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ExamResponse> getPublishedExamsByCourseForStudent(
            Long courseId,
            String email) {

        if (!courseRepository.existsById(courseId)) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Course not found"
            );
        }

        boolean enrolled = enrollmentRepository
            .existsByStudent_EmailAndCourse_Id(email, courseId);

        if (!enrolled) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "You are not enrolled in this course"
            );
        }

        return examRepository
            .findByPublishedTrueAndCourse_IdOrderByCreatedAtDesc(courseId)
            .stream()
            .map(ExamResponse::from)
            .toList();
    }

    /*
     * Admin can retrieve any existing exam.
     */
    @Transactional(readOnly = true)
    public ExamResponse getExamById(Long id) {
        return ExamResponse.from(findExam(id));
    }

    /*
     * Student can retrieve an exam only when:
     * 1. The exam exists.
     * 2. The exam is published.
     * 3. The student is enrolled in its course.
     */
    @Transactional(readOnly = true)
    public ExamResponse getExamByIdForStudent(Long id, String email) {

        Exam exam = findExam(id);

        if (!Boolean.TRUE.equals(exam.getPublished())) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "This exam is not published"
            );
        }

        Long courseId = exam.getCourse().getId();

        boolean enrolled = enrollmentRepository
            .existsByStudent_EmailAndCourse_Id(email, courseId);

        if (!enrolled) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "You are not enrolled in this exam's course"
            );
        }

        return ExamResponse.from(exam);
    }

    public ExamResponse updateExam(Long id, ExamRequest request) {
        Exam exam = findExam(id);

        applyRequest(exam, request);

        return ExamResponse.from(examRepository.save(exam));
    }

    public void deleteExam(Long id) {
        Exam exam = findExam(id);
        examRepository.delete(exam);
    }

    private Exam findExam(Long id) {
        return examRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Exam not found"
            ));
    }

    private void applyRequest(Exam exam, ExamRequest request) {

        if (request == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Exam details are required"
            );
        }

        if (request.getTitle() == null
                || request.getTitle().isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Exam title is required"
            );
        }

        if (request.getTitle().trim().length() > 150) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Exam title must not exceed 150 characters"
            );
        }

        if (request.getDescription() == null
                || request.getDescription().isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Exam description is required"
            );
        }

        if (request.getDescription().trim().length() > 2000) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Exam description must not exceed 2000 characters"
            );
        }

        if (request.getCourseId() == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Course ID is required"
            );
        }

        if (request.getDurationMinutes() == null
                || request.getDurationMinutes() < 1
                || request.getDurationMinutes() > 600) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Exam duration must be between 1 and 600 minutes"
            );
        }

        Course course = courseRepository.findById(request.getCourseId())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Course not found"
            ));

        exam.setTitle(request.getTitle().trim());
        exam.setDescription(request.getDescription().trim());
        exam.setCourse(course);
        exam.setDurationMinutes(request.getDurationMinutes());

        if (request.getPublished() != null) {
            exam.setPublished(request.getPublished());
        } else if (exam.getPublished() == null) {
            exam.setPublished(false);
        }
    }
}
