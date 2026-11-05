
package com.nexora.nexora_backend.controller;

import java.util.List;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nexora.nexora_backend.dto.CertificateResponse;
import com.nexora.nexora_backend.dto.CertificateVerificationResponse;
import com.nexora.nexora_backend.entity.Certificate;
import com.nexora.nexora_backend.service.CertificateService;
import com.nexora.nexora_backend.service.PdfGenerationService;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    private final CertificateService certificateService;
    private final PdfGenerationService pdfGenerationService;

    public CertificateController(
            CertificateService certificateService,
            PdfGenerationService pdfGenerationService) {

        this.certificateService = certificateService;
        this.pdfGenerationService = pdfGenerationService;
    }

    // Student: Get own certificates
    @GetMapping("/my")
    public ResponseEntity<List<CertificateResponse>> getMyCertificates(
            Authentication authentication) {

        return ResponseEntity.ok(
                certificateService.getMyCertificates(
                        authentication.getName()
                )
        );
    }

    // Student: Get one of their own certificates
    @GetMapping("/my/{certificateId}")
    public ResponseEntity<CertificateResponse> getMyCertificate(
            @PathVariable Long certificateId,
            Authentication authentication) {

        return ResponseEntity.ok(
                certificateService.getMyCertificate(
                        certificateId,
                        authentication.getName()
                )
        );
    }

    // Student: Download own certificate PDF
    @GetMapping("/my/{certificateId}/pdf")
    public ResponseEntity<byte[]> downloadMyCertificate(
            @PathVariable Long certificateId,
            Authentication authentication) {

        Certificate certificate =
                certificateService.getCertificateForStudentPdf(
                        certificateId,
                        authentication.getName()
                );

        return createPdfResponse(
                pdfGenerationService.generateCertificatePdf(certificate),
                "Nexora-Certificate-"
                        + certificate.getCertificateNumber() + ".pdf"
        );
    }

    // Admin: Get all certificates
    @GetMapping
    public ResponseEntity<List<CertificateResponse>> getAllCertificates() {

        return ResponseEntity.ok(
                certificateService.getAllCertificates()
        );
    }

    // Admin: Get one certificate
    @GetMapping("/{certificateId}")
    public ResponseEntity<CertificateResponse> getCertificateById(
            @PathVariable Long certificateId) {

        Certificate certificate =
                certificateService.getCertificateForAdminPdf(certificateId);

        return ResponseEntity.ok(
                CertificateResponse.from(certificate)
        );
    }

    // Admin: Download any certificate PDF
    @GetMapping("/{certificateId}/pdf")
    public ResponseEntity<byte[]> downloadCertificate(
            @PathVariable Long certificateId) {

        Certificate certificate =
                certificateService.getCertificateForAdminPdf(certificateId);

        return createPdfResponse(
                pdfGenerationService.generateCertificatePdf(certificate),
                "Nexora-Certificate-"
                        + certificate.getCertificateNumber() + ".pdf"
        );
    }

    // Public: Verify a certificate using its certificate number
    @GetMapping("/verify/{certificateNumber}")
    public ResponseEntity<CertificateVerificationResponse> verifyCertificate(
            @PathVariable String certificateNumber) {

        return ResponseEntity.ok(
                certificateService.verifyCertificate(certificateNumber)
        );
    }

    private ResponseEntity<byte[]> createPdfResponse(
            byte[] pdf,
            String filename) {

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(MediaType.APPLICATION_PDF);

        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename(filename)
                        .build()
        );

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdf);
    }
}
