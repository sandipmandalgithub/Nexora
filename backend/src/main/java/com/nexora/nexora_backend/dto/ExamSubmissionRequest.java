
package com.nexora.nexora_backend.dto;

import java.util.List;

public record ExamSubmissionRequest(
        List<AnswerSubmission> answers) {

    public record AnswerSubmission(
            Long questionId,
            String selectedOption) {
    }
}
