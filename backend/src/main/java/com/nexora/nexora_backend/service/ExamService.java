
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
import com.nexora.nexora_backend.repository.ExamRepository;

@Service
@Transactional
public class ExamService {

    private final ExamRepository examRepository;
    private final CourseRepository courseRepository;

    public ExamService(
            ExamRepository examRepository,
            CourseRepository courseRepository) {
        this.examRepository = examRepository;
        this.courseRepository = courseRepository;
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
    public ExamResponse getExamById(Long id) {
        return ExamResponse.from(findExam(id));
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
