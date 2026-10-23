
package com.nexora.nexora_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nexora.nexora_backend.entity.ExamAttempt;
import com.nexora.nexora_backend.entity.ExamAttempt.AttemptStatus;

@Repository
public interface ExamAttemptRepository
        extends JpaRepository<ExamAttempt, Long> {

    List<ExamAttempt> findByStudent_IdOrderByStartedAtDesc(Long studentId);

    List<ExamAttempt> findByExam_IdOrderByStartedAtDesc(Long examId);

    Optional<ExamAttempt> findByIdAndStudent_Id(
            Long attemptId,
            Long studentId);

    boolean existsByStudent_IdAndExam_IdAndStatus(
            Long studentId,
            Long examId,
            AttemptStatus status);
}
