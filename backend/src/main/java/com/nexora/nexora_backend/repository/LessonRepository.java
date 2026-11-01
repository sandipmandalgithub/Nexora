package com.nexora.nexora_backend.repository;

import com.nexora.nexora_backend.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByModule_IdOrderByOrderIndexAscIdAsc(Long moduleId);

    Optional<Lesson> findByIdAndModule_Id(Long id, Long moduleId);

    long countByModule_Course_Id(Long courseId);

    void deleteByModule_Id(Long moduleId);
}