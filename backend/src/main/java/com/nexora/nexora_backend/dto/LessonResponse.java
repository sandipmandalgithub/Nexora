package com.nexora.nexora_backend.dto;

import com.nexora.nexora_backend.entity.Lesson;
import java.time.LocalDateTime;

public class LessonResponse {

    private Long id;
    private Long moduleId;
    private String title;
    private String description;
    private String videoUrl;
    private String content;
    private Integer duration;
    private Integer orderIndex;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public LessonResponse(Lesson lesson) {
        this.id = lesson.getId();
        this.moduleId = lesson.getModule().getId();
        this.title = lesson.getTitle();
        this.description = lesson.getDescription();
        this.videoUrl = lesson.getVideoUrl();
        this.content = lesson.getContent();
        this.duration = lesson.getDuration();
        this.orderIndex = lesson.getOrderIndex();
        this.createdAt = lesson.getCreatedAt();
        this.updatedAt = lesson.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getModuleId() {
        return moduleId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public String getContent() {
        return content;
    }

    public Integer getDuration() {
        return duration;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}