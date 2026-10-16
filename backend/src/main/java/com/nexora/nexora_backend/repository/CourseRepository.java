package com.nexora.nexora_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nexora.nexora_backend.entity.Course;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByPublishedTrueOrderByCreatedAtDesc();

    List<Course> findAllByOrderByCreatedAtDesc();
}
