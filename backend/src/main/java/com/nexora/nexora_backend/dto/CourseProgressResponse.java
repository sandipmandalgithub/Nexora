package com.nexora.nexora_backend.dto;

public class CourseProgressResponse {

    private Long courseId;
    private long totalLessons;
    private long completedLessons;
    private double progressPercentage;

    public CourseProgressResponse(
            Long courseId,
            long totalLessons,
            long completedLessons,
            double progressPercentage
    ) {
        this.courseId = courseId;
        this.totalLessons = totalLessons;
        this.completedLessons = completedLessons;
        this.progressPercentage = progressPercentage;
    }

    public Long getCourseId() {
        return courseId;
    }

    public long getTotalLessons() {
        return totalLessons;
    }

    public long getCompletedLessons() {
        return completedLessons;
    }

    public double getProgressPercentage() {
        return progressPercentage;
    }
}