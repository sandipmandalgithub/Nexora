
package com.nexora.nexora_backend.service;

import java.io.ByteArrayOutputStream;

import org.springframework.stereotype.Service;

import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Element;
import com.lowagie.text.pdf.PdfWriter;

import com.nexora.nexora_backend.entity.Certificate;
import com.nexora.nexora_backend.entity.GradeCard;

@Service
public class PdfGenerationService {

    public byte[] generateGradeCardPdf(GradeCard gradeCard) {

        try (ByteArrayOutputStream outputStream =
                     new ByteArrayOutputStream()) {

            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, outputStream);

            document.open();

            Font titleFont = FontFactory.getFont(
                    FontFactory.HELVETICA,
                    22,
                    Font.BOLD
            );

            Font headingFont = FontFactory.getFont(
                    FontFactory.HELVETICA,
                    14,
                    Font.BOLD
            );

            Font normalFont = FontFactory.getFont(
                    FontFactory.HELVETICA,
                    11,
                    Font.NORMAL
            );

            Paragraph title = new Paragraph(
                    "NEXORA - GRADE CARD",
                    titleFont
            );

            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(new Paragraph(
                    "Learning and Online Examination Platform",
                    normalFont
            ));

            document.add(Chunk.NEWLINE);
            document.add(new Paragraph("STUDENT DETAILS", headingFont));
            document.add(Chunk.NEWLINE);

            addLine(document, "Student Name",
                    gradeCard.getStudent().getFullName(), normalFont);

            addLine(document, "Student ID",
                    String.valueOf(gradeCard.getStudent().getId()),
                    normalFont);

            addLine(document, "Course",
                    gradeCard.getCourse().getTitle(), normalFont);

            addLine(document, "Exam",
                    gradeCard.getExam().getTitle(), normalFont);

            document.add(Chunk.NEWLINE);
            document.add(new Paragraph("EXAM RESULT", headingFont));
            document.add(Chunk.NEWLINE);

            addLine(document, "Attempt ID",
                    String.valueOf(gradeCard.getAttempt().getId()),
                    normalFont);

            addLine(document, "Score",
                    gradeCard.getScore() + " / "
                            + gradeCard.getTotalMarks(),
                    normalFont);

            addLine(document, "Percentage",
                    gradeCard.getPercentage() + "%",
                    normalFont);

            addLine(document, "Grade",
                    gradeCard.getGrade(), normalFont);

            addLine(document, "Result",
                    String.valueOf(gradeCard.getResult()),
                    normalFont);

            addLine(document, "Issued At",
                    String.valueOf(gradeCard.getIssuedAt()),
                    normalFont);

            document.add(Chunk.NEWLINE);

            Paragraph footer = new Paragraph(
                    "This is an electronically generated grade card "
                            + "issued by Nexora.",
                    normalFont
            );

            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();

            return outputStream.toByteArray();

        } catch (DocumentException exception) {
            throw new IllegalStateException(
                    "Unable to generate grade card PDF",
                    exception
            );
        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Unable to generate grade card PDF",
                    exception
            );
        }
    }

    public byte[] generateCertificatePdf(Certificate certificate) {

        try (ByteArrayOutputStream outputStream =
                     new ByteArrayOutputStream()) {

            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, outputStream);

            document.open();

            Font titleFont = FontFactory.getFont(
                    FontFactory.HELVETICA,
                    28,
                    Font.BOLD
            );

            Font subtitleFont = FontFactory.getFont(
                    FontFactory.HELVETICA,
                    16,
                    Font.BOLD
            );

            Font nameFont = FontFactory.getFont(
                    FontFactory.HELVETICA,
                    24,
                    Font.BOLD
            );

            Font normalFont = FontFactory.getFont(
                    FontFactory.HELVETICA,
                    12,
                    Font.NORMAL
            );

            document.add(Chunk.NEWLINE);
            document.add(Chunk.NEWLINE);

            Paragraph title = new Paragraph(
                    "NEXORA",
                    titleFont
            );

            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph subtitle = new Paragraph(
                    "CERTIFICATE OF COMPLETION",
                    subtitleFont
            );

            subtitle.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitle);

            document.add(Chunk.NEWLINE);
            document.add(Chunk.NEWLINE);

            Paragraph introduction = new Paragraph(
                    "This is to certify that",
                    normalFont
            );

            introduction.setAlignment(Element.ALIGN_CENTER);
            document.add(introduction);

            document.add(Chunk.NEWLINE);

            Paragraph studentName = new Paragraph(
                    certificate.getStudent().getFullName(),
                    nameFont
            );

            studentName.setAlignment(Element.ALIGN_CENTER);
            document.add(studentName);

            document.add(Chunk.NEWLINE);

            Paragraph completionText = new Paragraph(
                    "has successfully completed all published "
                            + "examinations for the course",
                    normalFont
            );

            completionText.setAlignment(Element.ALIGN_CENTER);
            document.add(completionText);

            document.add(Chunk.NEWLINE);

            Paragraph courseName = new Paragraph(
                    certificate.getCourse().getTitle(),
                    subtitleFont
            );

            courseName.setAlignment(Element.ALIGN_CENTER);
            document.add(courseName);

            document.add(Chunk.NEWLINE);
            document.add(Chunk.NEWLINE);

            Paragraph issuedText = new Paragraph(
                    "Date of Issue: "
                            + certificate.getIssuedAt(),
                    normalFont
            );

            issuedText.setAlignment(Element.ALIGN_CENTER);
            document.add(issuedText);

            document.add(Chunk.NEWLINE);

            Paragraph certificateNumber = new Paragraph(
                    "Certificate ID: "
                            + certificate.getCertificateNumber(),
                    normalFont
            );

            certificateNumber.setAlignment(Element.ALIGN_CENTER);
            document.add(certificateNumber);

            document.add(Chunk.NEWLINE);
            document.add(Chunk.NEWLINE);

            Paragraph footer = new Paragraph(
                    "Nexora - Learning and Online Examination Platform",
                    normalFont
            );

            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();

            return outputStream.toByteArray();

        } catch (DocumentException exception) {
            throw new IllegalStateException(
                    "Unable to generate certificate PDF",
                    exception
            );
        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Unable to generate certificate PDF",
                    exception
            );
        }
    }

    private void addLine(
            Document document,
            String label,
            String value,
            Font font) throws DocumentException {

        document.add(new Paragraph(
                label + ": " + (value == null ? "" : value),
                font
        ));
    }
}
