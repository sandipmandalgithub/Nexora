package com.nexora.nexora_backend.repository;

import com.nexora.nexora_backend.entity.CourseModule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseModuleRepository
        extends JpaRepository<CourseModule, Long> {

    List<CourseModule> findByCourse_IdOrderByOrderIndexAscIdAsc(Long courseId);

    Optional<CourseModule> findByIdAndCourse_Id(Long id, Long courseId);
}