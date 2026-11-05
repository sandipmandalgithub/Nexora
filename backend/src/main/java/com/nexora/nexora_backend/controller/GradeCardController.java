
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

import com.nexora.nexora_backend.dto.GradeCardResponse;
import com.nexora.nexora_backend.entity.GradeCard;
import com.nexora.nexora_backend.service.GradeCardService;
import com.nexora.nexora_backend.service.PdfGenerationService;

@RestController
@RequestMapping("/api/grade-cards")
public class GradeCardController {

    private final GradeCardService gradeCardService;
    private final PdfGenerationService pdfGenerationService;

    public GradeCardController(
            GradeCardService gradeCardService,
            PdfGenerationService pdfGenerationService) {

        this.gradeCardService = gradeCardService;
        this.pdfGenerationService = pdfGenerationService;
    }

    // Student: Get own grade cards
    @GetMapping("/my")
    public ResponseEntity<List<GradeCardResponse>> getMyGradeCards(
            Authentication authentication) {

        return ResponseEntity.ok(
                gradeCardService.getMyGradeCards(
                        authentication.getName()
                )
        );
    }

    // Student: Get one of their own grade cards
    @GetMapping("/my/{gradeCardId}")
    public ResponseEntity<GradeCardResponse> getMyGradeCard(
            @PathVariable Long gradeCardId,
            Authentication authentication) {

        return ResponseEntity.ok(
                gradeCardService.getMyGradeCard(
                        gradeCardId,
                        authentication.getName()
                )
        );
    }

    // Student: Download own grade card PDF
    @GetMapping("/my/{gradeCardId}/pdf")
    public ResponseEntity<byte[]> downloadMyGradeCard(
            @PathVariable Long gradeCardId,
            Authentication authentication) {

        GradeCard gradeCard =
                gradeCardService.getGradeCardForStudentPdf(
                        gradeCardId,
                        authentication.getName()
                );

        return createPdfResponse(
                pdfGenerationService.generateGradeCardPdf(gradeCard),
                "Nexora-Grade-Card-" + gradeCard.getId() + ".pdf"
        );
    }

    // Admin: Get all grade cards
    @GetMapping
    public ResponseEntity<List<GradeCardResponse>> getAllGradeCards() {

        return ResponseEntity.ok(
                gradeCardService.getAllGradeCards()
        );
    }

    // Admin: Get one grade card
    @GetMapping("/{gradeCardId}")
    public ResponseEntity<GradeCardResponse> getGradeCardById(
            @PathVariable Long gradeCardId) {

        GradeCard gradeCard =
                gradeCardService.getGradeCardForAdminPdf(gradeCardId);

        return ResponseEntity.ok(
                GradeCardResponse.from(gradeCard)
        );
    }

    // Admin: Download any grade card PDF
    @GetMapping("/{gradeCardId}/pdf")
    public ResponseEntity<byte[]> downloadGradeCard(
            @PathVariable Long gradeCardId) {

        GradeCard gradeCard =
                gradeCardService.getGradeCardForAdminPdf(gradeCardId);

        return createPdfResponse(
                pdfGenerationService.generateGradeCardPdf(gradeCard),
                "Nexora-Grade-Card-" + gradeCard.getId() + ".pdf"
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
