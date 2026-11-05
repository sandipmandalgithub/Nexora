
package com.nexora.nexora_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nexora.nexora_backend.entity.Certificate;

@Repository
public interface CertificateRepository
        extends JpaRepository<Certificate, Long> {

    boolean existsByStudent_IdAndCourse_Id(
            Long studentId,
            Long courseId);

    List<Certificate> findByStudent_IdOrderByIssuedAtDesc(Long studentId);

    List<Certificate> findAllByOrderByIssuedAtDesc();

    Optional<Certificate> findByIdAndStudent_Id(
            Long id,
            Long studentId);

    Optional<Certificate> findByCertificateNumber(String certificateNumber);
}
