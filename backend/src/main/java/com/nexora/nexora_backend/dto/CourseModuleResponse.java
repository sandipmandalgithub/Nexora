package com.nexora.nexora_backend.dto;

import com.nexora.nexora_backend.entity.CourseModule;

import java.time.LocalDateTime;

public class CourseModuleResponse {

    private Long id;
    private Long courseId;
    private String title;
    private String description;
    private Integer orderIndex;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CourseModuleResponse(CourseModule module) {
        this.id = module.getId();
        this.courseId = module.getCourse().getId();
        this.title = module.getTitle();
        this.description = module.getDescription();
        this.orderIndex = module.getOrderIndex();
        this.createdAt = module.getCreatedAt();
        this.updatedAt = module.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
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