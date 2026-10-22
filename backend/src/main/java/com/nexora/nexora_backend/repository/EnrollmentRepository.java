
package com.nexora.nexora_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nexora.nexora_backend.entity.Enrollment;

@Repository
public interface EnrollmentRepository
        extends JpaRepository<Enrollment, Long> {

    boolean existsByStudent_IdAndCourse_Id(
        Long studentId,
        Long courseId
    );

    List<Enrollment> findByStudent_EmailOrderByCreatedAtDesc(
        String email
    );

    List<Enrollment> findAllByOrderByCreatedAtDesc();

    Optional<Enrollment> findByIdAndStudent_Email(
        Long id,
        String email
    );
}
