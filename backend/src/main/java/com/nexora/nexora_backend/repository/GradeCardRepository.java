
package com.nexora.nexora_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nexora.nexora_backend.entity.GradeCard;

@Repository
public interface GradeCardRepository
        extends JpaRepository<GradeCard, Long> {

    boolean existsByAttempt_Id(Long attemptId);

    List<GradeCard> findByStudent_IdOrderByIssuedAtDesc(Long studentId);

    List<GradeCard> findAllByOrderByIssuedAtDesc();

    Optional<GradeCard> findByIdAndStudent_Id(
            Long id,
            Long studentId);

    List<GradeCard> findByStudent_IdAndExam_Id(Long studentId, Long examId);
}
