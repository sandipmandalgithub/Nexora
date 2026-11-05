
package com.nexora.nexora_backend.dto;

import java.time.LocalDateTime;

import com.nexora.nexora_backend.entity.Certificate;

public record CertificateResponse(
        Long id,
        String certificateNumber,
        Long studentId,
        String studentName,
        String studentEmail,
        Long courseId,
        String courseTitle,
        Certificate.CertificateStatus status,
        LocalDateTime issuedAt
) {
    public static CertificateResponse from(Certificate certificate) {
        return new CertificateResponse(
                certificate.getId(),
                certificate.getCertificateNumber(),
                certificate.getStudent().getId(),
                certificate.getStudent().getFullName(),
                certificate.getStudent().getEmail(),
                certificate.getCourse().getId(),
                certificate.getCourse().getTitle(),
                certificate.getStatus(),
                certificate.getIssuedAt()
        );
    }
}
