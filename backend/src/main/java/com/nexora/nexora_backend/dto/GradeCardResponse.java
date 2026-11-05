
package com.nexora.nexora_backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.nexora.nexora_backend.entity.GradeCard;

public record GradeCardResponse(
        Long id,
        Long attemptId,
        Long studentId,
        String studentName,
        Long examId,
        String examTitle,
        Long courseId,
        String courseTitle,
        Integer score,
        Integer totalMarks,
        BigDecimal percentage,
        String grade,
        GradeCard.Result result,
        LocalDateTime issuedAt
) {
    public static GradeCardResponse from(GradeCard gradeCard) {
        return new GradeCardResponse(
                gradeCard.getId(),
                gradeCard.getAttempt().getId(),
                gradeCard.getStudent().getId(),
                gradeCard.getStudent().getFullName(),
                gradeCard.getExam().getId(),
                gradeCard.getExam().getTitle(),
                gradeCard.getCourse().getId(),
                gradeCard.getCourse().getTitle(),
                gradeCard.getScore(),
                gradeCard.getTotalMarks(),
                gradeCard.getPercentage(),
                gradeCard.getGrade(),
                gradeCard.getResult(),
                gradeCard.getIssuedAt()
        );
    }
}
