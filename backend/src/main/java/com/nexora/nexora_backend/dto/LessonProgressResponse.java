package com.nexora.nexora_backend.dto;

import com.nexora.nexora_backend.entity.LessonProgress;

import java.time.LocalDateTime;

public class LessonProgressResponse {

    private Long lessonId;
    private boolean completed;
    private LocalDateTime completedAt;

    public LessonProgressResponse(
            Long lessonId,
            boolean completed,
            LocalDateTime completedAt
    ) {
        this.lessonId = lessonId;
        this.completed = completed;
        this.completedAt = completedAt;
    }

    public LessonProgressResponse(LessonProgress progress) {
        this.lessonId = progress.getLesson().getId();
        this.completed = progress.isCompleted();
        this.completedAt = progress.getCompletedAt();
    }

    public Long getLessonId() {
        return lessonId;
    }

    public boolean isCompleted() {
        return completed;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
}