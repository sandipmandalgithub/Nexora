
package com.nexora.nexora_backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.nexora.nexora_backend.dto.CertificateResponse;
import com.nexora.nexora_backend.dto.CertificateVerificationResponse;
import com.nexora.nexora_backend.entity.Certificate;
import com.nexora.nexora_backend.entity.User;
import com.nexora.nexora_backend.repository.CertificateRepository;

@Service
@Transactional(readOnly = true)
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final UserService userService;

    public CertificateService(
            CertificateRepository certificateRepository,
            UserService userService) {
        this.certificateRepository = certificateRepository;
        this.userService = userService;
    }

    public List<CertificateResponse> getMyCertificates(String email) {

        User student = findStudent(email);

        return certificateRepository
                .findByStudent_IdOrderByIssuedAtDesc(student.getId())
                .stream()
                .map(CertificateResponse::from)
                .toList();
    }

    public CertificateResponse getMyCertificate(
            Long certificateId,
            String email) {

        User student = findStudent(email);

        Certificate certificate = certificateRepository
                .findByIdAndStudent_Id(certificateId, student.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Certificate not found"
                ));

        return CertificateResponse.from(certificate);
    }

    public List<CertificateResponse> getAllCertificates() {

        return certificateRepository
                .findAllByOrderByIssuedAtDesc()
                .stream()
                .map(CertificateResponse::from)
                .toList();
    }

    public Certificate getCertificateForStudentPdf(
            Long certificateId,
            String email) {

        User student = findStudent(email);

        return certificateRepository
                .findByIdAndStudent_Id(certificateId, student.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Certificate not found"
                ));
    }

    public Certificate getCertificateForAdminPdf(Long certificateId) {

        return certificateRepository.findById(certificateId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Certificate not found"
                ));
    }

    public CertificateVerificationResponse verifyCertificate(
            String certificateNumber) {

        if (certificateNumber == null || certificateNumber.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Certificate number is required"
            );
        }

        Certificate certificate = certificateRepository
                .findByCertificateNumber(certificateNumber.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Certificate not found"
                ));

        return CertificateVerificationResponse.from(certificate);
    }

    private User findStudent(String email) {

        return userService.getUserByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Student account not found"
                ));
    }
}
