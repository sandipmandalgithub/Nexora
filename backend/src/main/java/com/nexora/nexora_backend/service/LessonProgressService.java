
package com.nexora.nexora_backend.service;

import com.nexora.nexora_backend.dto.CourseProgressResponse;
import com.nexora.nexora_backend.dto.LessonProgressRequest;
import com.nexora.nexora_backend.entity.Enrollment;
import com.nexora.nexora_backend.entity.Enrollment.EnrollmentStatus;
import com.nexora.nexora_backend.entity.Lesson;
import com.nexora.nexora_backend.entity.LessonProgress;
import com.nexora.nexora_backend.entity.User;
import com.nexora.nexora_backend.repository.EnrollmentRepository;
import com.nexora.nexora_backend.repository.LessonProgressRepository;
import com.nexora.nexora_backend.repository.LessonRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class LessonProgressService {

    private final LessonProgressRepository progressRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public LessonProgressService(
            LessonProgressRepository progressRepository,
            LessonRepository lessonRepository,
            EnrollmentRepository enrollmentRepository
    ) {
        this.progressRepository = progressRepository;
        this.lessonRepository = lessonRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    private User getStudent(String email) {
        return entityManager
                .createQuery(
                        "SELECT u FROM User u WHERE u.email = :email",
                        User.class
                )
                .setParameter("email", email)
                .getResultStream()
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Student account not found"
                ));
    }

    private Lesson getLesson(Long lessonId) {
        return lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Lesson not found"
                ));
    }

    private void validateEnrollment(String email, Long courseId) {
        if (email == null ||
                email.isBlank() ||
                !enrollmentRepository
                        .existsByStudent_EmailAndCourse_Id(email, courseId)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You must be enrolled in this course to update or view progress"
            );
        }
    }

    @Transactional
    public LessonProgress markLessonProgress(
            Long lessonId,
            LessonProgressRequest request,
            String email
    ) {
        if (request == null || request.getCompleted() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Completed status is required"
            );
        }

        Lesson lesson = getLesson(lessonId);
        Long courseId = lesson.getModule().getCourse().getId();

        validateEnrollment(email, courseId);

        User student = getStudent(email);

        LessonProgress progress = progressRepository
                .findByStudent_EmailAndLesson_Id(email, lessonId)
                .orElseGet(() -> {
                    LessonProgress newProgress = new LessonProgress();
                    newProgress.setStudent(student);
                    newProgress.setLesson(lesson);
                    return newProgress;
                });

        boolean completed = request.getCompleted();

        progress.setCompleted(completed);
        progress.setCompletedAt(
                completed ? LocalDateTime.now() : null
        );

        LessonProgress savedProgress = progressRepository.save(progress);

        updateCourseCompletion(email, courseId);

        return savedProgress;
    }

    @Transactional(readOnly = true)
    public boolean isLessonCompleted(Long lessonId, String email) {
        Lesson lesson = getLesson(lessonId);
        Long courseId = lesson.getModule().getCourse().getId();

        validateEnrollment(email, courseId);

        return progressRepository
                .findByStudent_EmailAndLesson_Id(email, lessonId)
                .map(LessonProgress::isCompleted)
                .orElse(false);
    }

    @Transactional
    public CourseProgressResponse getCourseProgress(
            Long courseId,
            String email
    ) {
        validateEnrollment(email, courseId);

        long totalLessons = lessonRepository
                .countByModule_Course_Id(courseId);

        long completedLessons = progressRepository
                .countByStudent_EmailAndLesson_Module_Course_IdAndCompletedTrue(
                        email,
                        courseId
                );

        updateEnrollmentStatus(
                email,
                courseId,
                totalLessons,
                completedLessons
        );

        double percentage = totalLessons == 0
                ? 0.0
                : Math.round(
                        (completedLessons * 10000.0) / totalLessons
                ) / 100.0;

        return new CourseProgressResponse(
                courseId,
                totalLessons,
                completedLessons,
                percentage
        );
    }

    private void updateCourseCompletion(
            String email,
            Long courseId
    ) {
        long totalLessons = lessonRepository
                .countByModule_Course_Id(courseId);

        long completedLessons = progressRepository
                .countByStudent_EmailAndLesson_Module_Course_IdAndCompletedTrue(
                        email,
                        courseId
                );

        updateEnrollmentStatus(
                email,
                courseId,
                totalLessons,
                completedLessons
        );
    }

    private void updateEnrollmentStatus(
            String email,
            Long courseId,
            long totalLessons,
            long completedLessons
    ) {
        Enrollment enrollment = enrollmentRepository
                .findByStudent_EmailAndCourse_Id(email, courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Enrollment not found"
                ));

        boolean courseCompleted =
                totalLessons > 0 && completedLessons >= totalLessons;

        if (courseCompleted) {
            if (enrollment.getStatus() != EnrollmentStatus.COMPLETED) {
                enrollment.setStatus(EnrollmentStatus.COMPLETED);
                enrollment.setCompletedAt(LocalDateTime.now());

                enrollmentRepository.save(enrollment);
            }
        } else {
            if (enrollment.getStatus() != EnrollmentStatus.ENROLLED) {
                enrollment.setStatus(EnrollmentStatus.ENROLLED);
                enrollment.setCompletedAt(null);

                enrollmentRepository.save(enrollment);
            }
        }
    }

    @Transactional
    public void deleteLessonProgress(Long lessonId) {
        progressRepository.deleteByLesson_Id(lessonId);
    }
}
