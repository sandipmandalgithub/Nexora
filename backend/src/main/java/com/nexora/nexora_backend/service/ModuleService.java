package com.nexora.nexora_backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.nexora.nexora_backend.dto.ModuleRequest;
import com.nexora.nexora_backend.entity.Course;
import com.nexora.nexora_backend.entity.CourseModule;
import com.nexora.nexora_backend.entity.Lesson;
import com.nexora.nexora_backend.repository.CourseModuleRepository;
import com.nexora.nexora_backend.repository.EnrollmentRepository;
import com.nexora.nexora_backend.repository.LessonProgressRepository;
import com.nexora.nexora_backend.repository.LessonRepository;

@Service
@Transactional
public class ModuleService {

    private final CourseModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository progressRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseService courseService;

    public ModuleService(
            CourseModuleRepository moduleRepository,
            LessonRepository lessonRepository,
            LessonProgressRepository progressRepository,
            EnrollmentRepository enrollmentRepository,
            CourseService courseService) {

        this.moduleRepository = moduleRepository;
        this.lessonRepository = lessonRepository;
        this.progressRepository = progressRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.courseService = courseService;
    }

    @Transactional(readOnly = true)
    public List<CourseModule> getModules(
            Long courseId,
            boolean isAdmin,
            String email) {

        validateCourseAccess(courseId, isAdmin, email);

        return moduleRepository
                .findByCourse_IdOrderByOrderIndexAscIdAsc(courseId);
    }

    public CourseModule createModule(
            Long courseId,
            ModuleRequest request) {

        Course course = courseService.getCourseById(courseId, true);

        validateRequest(request);

        CourseModule module = new CourseModule();
        module.setCourse(course);

        applyRequest(module, request);

        return moduleRepository.save(module);
    }

    public CourseModule updateModule(
            Long courseId,
            Long moduleId,
            ModuleRequest request) {

        CourseModule module = moduleRepository
                .findByIdAndCourse_Id(moduleId, courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Module not found"
                ));

        validateRequest(request);
        applyRequest(module, request);

        return moduleRepository.save(module);
    }

    public void deleteModule(Long courseId, Long moduleId) {

        CourseModule module = moduleRepository
                .findByIdAndCourse_Id(moduleId, courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Module not found"
                ));

        List<Lesson> lessons = lessonRepository
                .findByModule_IdOrderByOrderIndexAscIdAsc(moduleId);

        // Delete lesson progress before deleting lessons.
        for (Lesson lesson : lessons) {
            progressRepository.deleteByLesson_Id(lesson.getId());
        }

        // Delete all lessons belonging to this module.
        lessonRepository.deleteByModule_Id(moduleId);

        // Finally, delete the module.
        moduleRepository.delete(module);
    }

    private void validateCourseAccess(
            Long courseId,
            boolean isAdmin,
            String email) {

        courseService.getCourseById(courseId, isAdmin);

        if (!isAdmin) {
            boolean enrolled = enrollmentRepository
                    .existsByStudent_EmailAndCourse_Id(email, courseId);

            if (!enrolled) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not enrolled in this course"
                );
            }
        }
    }

    private void validateRequest(ModuleRequest request) {

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Module details are required"
            );
        }

        if (request.getTitle() == null
                || request.getTitle().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Module title is required"
            );
        }

        if (request.getTitle().trim().length() > 150) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Module title must not exceed 150 characters"
            );
        }

        if (request.getDescription() != null
                && request.getDescription().length() > 2000) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Module description must not exceed 2000 characters"
            );
        }

        if (request.getOrderIndex() != null
                && request.getOrderIndex() < 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Order index cannot be negative"
            );
        }
    }

    private void applyRequest(
            CourseModule module,
            ModuleRequest request) {

        module.setTitle(request.getTitle().trim());

        module.setDescription(
                request.getDescription() == null
                        || request.getDescription().isBlank()
                        ? null
                        : request.getDescription().trim()
        );

        module.setOrderIndex(
                request.getOrderIndex() == null
                        ? 0
                        : request.getOrderIndex()
        );
    }
}