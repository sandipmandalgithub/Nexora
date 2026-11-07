package com.nexora.nexora_backend.dto;

import java.time.LocalDateTime;

import com.nexora.nexora_backend.entity.Course;

public class CourseResponse {

    private Long id;
    private String title;
    private String description;
    private String category;
    private String instructorName;
    private String imageUrl;
    private Boolean published;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CourseResponse(Course course) {
        this.id = course.getId();
        this.title = course.getTitle();
        this.description = course.getDescription();
        this.category = course.getCategory();
        this.instructorName = course.getInstructorName();
        this.imageUrl = course.getImageUrl();
        this.published = course.getPublished();
        this.createdAt = course.getCreatedAt();
        this.updatedAt = course.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public String getInstructorName() {
        return instructorName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Boolean getPublished() {
        return published;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}