
package com.nexora.nexora_backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(
    name = "certificates",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_certificate_number",
            columnNames = "certificate_number"
        ),
        @UniqueConstraint(
            name = "uk_certificate_student_course",
            columnNames = {"student_id", "course_id"}
        )
    }
)
public class Certificate {

    public enum CertificateStatus {
        ISSUED,
        REVOKED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
        name = "certificate_number",
        nullable = false,
        unique = true,
        length = 60
    )
    private String certificateNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private CertificateStatus status = CertificateStatus.ISSUED;

    @Column(nullable = false, updatable = false)
    private LocalDateTime issuedAt;

    public Certificate() {
    }

    @PrePersist
    protected void onCreate() {
        if (issuedAt == null) {
            issuedAt = LocalDateTime.now();
        }

        if (status == null) {
            status = CertificateStatus.ISSUED;
        }
    }

    public Long getId() {
        return id;
    }

    public String getCertificateNumber() {
        return certificateNumber;
    }

    public void setCertificateNumber(String certificateNumber) {
        this.certificateNumber = certificateNumber;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public CertificateStatus getStatus() {
        return status;
    }

    public void setStatus(CertificateStatus status) {
        this.status = status;
    }

    public LocalDateTime getIssuedAt() {
        return issuedAt;
    }
}
