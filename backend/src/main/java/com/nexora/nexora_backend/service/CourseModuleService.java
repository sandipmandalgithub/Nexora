
package com.nexora.nexora_backend.service;

import com.nexora.nexora_backend.dto.CourseModuleRequest;
import com.nexora.nexora_backend.entity.Course;
import com.nexora.nexora_backend.entity.CourseModule;
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
public class CourseModuleService {

    private final CourseModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository progressRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseService courseService;

    public CourseModuleService(
            CourseModuleRepository moduleRepository,
            LessonRepository lessonRepository,
            LessonProgressRepository progressRepository,
            EnrollmentRepository enrollmentRepository,
            CourseService courseService
    ) {
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
            String email
    ) {

        validateCourseAccess(courseId, isAdmin, email);

        return moduleRepository
                .findByCourse_IdOrderByOrderIndexAscIdAsc(courseId);
    }

    @Transactional
    public CourseModule createModule(
            Long courseId,
            CourseModuleRequest request,
            boolean isAdmin
    ) {
        Course course = courseService.getCourseById(courseId, isAdmin);

        validateRequest(request);

        CourseModule module = new CourseModule();
        module.setCourse(course);

        applyRequest(module, request);

        return moduleRepository.save(module);
    }

    @Transactional
    public CourseModule updateModule(
            Long courseId,
            Long moduleId,
            CourseModuleRequest request,
            boolean isAdmin
    ) {
        courseService.getCourseById(courseId, isAdmin);

        validateRequest(request);

        CourseModule module = moduleRepository
                .findByIdAndCourse_Id(moduleId, courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Course module not found"
                ));

        applyRequest(module, request);

        return moduleRepository.save(module);
    }

    @Transactional
    public void deleteModule(
            Long courseId,
            Long moduleId,
            boolean isAdmin
    ) {
        courseService.getCourseById(courseId, isAdmin);

        CourseModule module = moduleRepository
                .findByIdAndCourse_Id(moduleId, courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Course module not found"
                ));

        // Delete all progress records associated with lessons
        // inside this module before deleting the lessons.
        progressRepository.deleteByLesson_Module_Id(moduleId);

        // Delete all lessons belonging to this module.
        lessonRepository.deleteByModule_Id(moduleId);

        // Finally, delete the module.
        moduleRepository.delete(module);
    }

    private void validateCourseAccess(
            Long courseId,
            boolean isAdmin,
            String email
    ) {

        // Also verifies that the course exists and is published
        // when the requester is not an administrator.
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
                    "You must be enrolled in this course to access its modules"
            );
        }
    }

    private void validateRequest(CourseModuleRequest request) {

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Module information is required"
            );
        }

        if (request.getTitle() == null ||
                request.getTitle().trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Module title is required"
            );
        }

        if (request.getTitle().trim().length() > 150) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Module title cannot exceed 150 characters"
            );
        }

        if (request.getDescription() != null &&
                request.getDescription().trim().length() > 2000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Module description cannot exceed 2000 characters"
            );
        }

        if (request.getOrderIndex() != null &&
                request.getOrderIndex() < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Module order cannot be negative"
            );
        }
    }

    private void applyRequest(
            CourseModule module,
            CourseModuleRequest request
    ) {
        module.setTitle(request.getTitle().trim());

        module.setDescription(
                request.getDescription() == null
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
