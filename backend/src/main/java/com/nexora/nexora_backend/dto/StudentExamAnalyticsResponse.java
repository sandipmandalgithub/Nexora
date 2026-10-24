
package com.nexora.nexora_backend.dto;

public record StudentExamAnalyticsResponse(
        long totalAttempts,
        long submittedAttempts,
        long inProgressAttempts,
        double averagePercentage,
        double bestPercentage) {
}
