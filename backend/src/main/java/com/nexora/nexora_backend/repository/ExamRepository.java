
package com.nexora.nexora_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nexora.nexora_backend.entity.Exam;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {

    List<Exam> findAllByOrderByCreatedAtDesc();

    List<Exam> findByPublishedTrueOrderByCreatedAtDesc();

    List<Exam> findByCourse_IdOrderByCreatedAtDesc(Long courseId);
}
