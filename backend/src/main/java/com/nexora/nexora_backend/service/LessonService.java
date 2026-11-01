package com.nexora.nexora_backend.service;

import com.nexora.nexora_backend.dto.LessonRequest;
import com.nexora.nexora_backend.entity.CourseModule;
import com.nexora.nexora_backend.entity.Lesson;
import com.nexora.nexora_backend.repository.CourseModuleRepository;
import com.nexora.nexora_backend.repository.EnrollmentRepository;
import com.nexora.nexora_backend.repository.LessonProgressRepository;
import com.nexora.nexora_backend.repository.LessonRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class LessonService {

    private final LessonRepository lessonRepository;
    private final CourseModuleRepository moduleRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonProgressRepository progressRepository;
    private final CourseService courseService;

    public LessonService(
            LessonRepository lessonRepository,
            CourseModuleRepository moduleRepository,
            EnrollmentRepository enrollmentRepository,
            LessonProgressRepository progressRepository,
            CourseService courseService
    ) {
        this.lessonRepository = lessonRepository;
        this.moduleRepository = moduleRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.progressRepository = progressRepository;
        this.courseService = courseService;
    }

    private CourseModule getModule(Long moduleId) {
        return moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Course module not found"
                ));
    }

    private void validateStudentAccess(
            CourseModule module,
            boolean isAdmin,
            String email
    ) {
        Long courseId = module.getCourse().getId();

        courseService.getCourseById(courseId, isAdmin);

        if (isAdmin) {
            return;
        }

        if (email == null ||
                email.isBlank() ||
                !enrollmentRepository
                        .existsByStudent_EmailAndCourse_Id(email, courseId)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You must be enrolled in this course to access its lessons"
            );
        }
    }

    @Transactional(readOnly = true)
    public List<Lesson> getLessons(
            Long moduleId,
            boolean isAdmin,
            String email
    ) {
        CourseModule module = getModule(moduleId);

        validateStudentAccess(module, isAdmin, email);

        return lessonRepository
                .findByModule_IdOrderByOrderIndexAscIdAsc(moduleId);
    }

    @Transactional
    public Lesson createLesson(Long moduleId, LessonRequest request) {
        CourseModule module = getModule(moduleId);

        validateRequest(request);

        Lesson lesson = new Lesson();
        lesson.setModule(module);

        applyRequest(lesson, request);

        return lessonRepository.save(lesson);
    }

    @Transactional
    public Lesson updateLesson(
            Long moduleId,
            Long lessonId,
            LessonRequest request
    ) {
        getModule(moduleId);
        validateRequest(request);

        Lesson lesson = lessonRepository
                .findByIdAndModule_Id(lessonId, moduleId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Lesson not found"
                ));

        applyRequest(lesson, request);

        return lessonRepository.save(lesson);
    }

    @Transactional
    public void deleteLesson(Long moduleId, Long lessonId) {
        getModule(moduleId);

        Lesson lesson = lessonRepository
                .findByIdAndModule_Id(lessonId, moduleId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Lesson not found"
                ));

        progressRepository.deleteByLesson_Id(lessonId);
        lessonRepository.delete(lesson);
    }

    private void validateRequest(LessonRequest request) {

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Lesson information is required"
            );
        }

        if (request.getTitle() == null ||
                request.getTitle().trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Lesson title is required"
            );
        }

        if (request.getTitle().trim().length() > 150) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Lesson title cannot exceed 150 characters"
            );
        }

        if (request.getDescription() != null &&
                request.getDescription().trim().length() > 2000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Lesson description cannot exceed 2000 characters"
            );
        }

        if (request.getVideoUrl() != null &&
                request.getVideoUrl().trim().length() > 1000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Video URL cannot exceed 1000 characters"
            );
        }

        if (request.getContent() != null &&
                request.getContent().length() > 100000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Lesson content cannot exceed 100000 characters"
            );
        }

        if (request.getDuration() != null &&
                request.getDuration() < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Lesson duration cannot be negative"
            );
        }

        if (request.getOrderIndex() != null &&
                request.getOrderIndex() < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Lesson order cannot be negative"
            );
        }
    }

    private void applyRequest(Lesson lesson, LessonRequest request) {

        lesson.setTitle(request.getTitle().trim());

        lesson.setDescription(
                request.getDescription() == null
                        ? null
                        : request.getDescription().trim()
        );

        lesson.setVideoUrl(
                request.getVideoUrl() == null ||
                        request.getVideoUrl().isBlank()
                        ? null
                        : request.getVideoUrl().trim()
        );

        lesson.setContent(request.getContent());

        lesson.setDuration(
                request.getDuration() == null
                        ? 0
                        : request.getDuration()
        );

        lesson.setOrderIndex(
                request.getOrderIndex() == null
                        ? 0
                        : request.getOrderIndex()
        );
    }
}