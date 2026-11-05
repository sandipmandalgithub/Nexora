
package com.nexora.nexora_backend.dto;

import java.time.LocalDateTime;

import com.nexora.nexora_backend.entity.Certificate;

public record CertificateVerificationResponse(
        boolean valid,
        String certificateNumber,
        String studentName,
        String courseTitle,
        Certificate.CertificateStatus status,
        LocalDateTime issuedAt,
        String message
) {
    public static CertificateVerificationResponse from(
            Certificate certificate) {

        boolean valid =
                certificate.getStatus() == Certificate.CertificateStatus.ISSUED;

        return new CertificateVerificationResponse(
                valid,
                certificate.getCertificateNumber(),
                certificate.getStudent().getFullName(),
                certificate.getCourse().getTitle(),
                certificate.getStatus(),
                certificate.getIssuedAt(),
                valid
                        ? "This certificate is valid."
                        : "This certificate is not currently valid."
        );
    }
}
