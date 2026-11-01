
package com.nexora.nexora_backend.repository;

import com.nexora.nexora_backend.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LessonProgressRepository
        extends JpaRepository<LessonProgress, Long> {

    Optional<LessonProgress> findByStudent_EmailAndLesson_Id(
            String email,
            Long lessonId
    );

    long countByStudent_EmailAndLesson_Module_Course_IdAndCompletedTrue(
            String email,
            Long courseId
    );

    void deleteByLesson_Id(Long lessonId);

    void deleteByLesson_Module_Id(Long moduleId);
}
