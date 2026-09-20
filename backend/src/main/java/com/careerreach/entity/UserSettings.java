package com.careerreach.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_settings", indexes = {
    @Index(name = "idx_user_settings_user_id", columnList = "user_id", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "max_emails_per_campaign", nullable = false)
    @Builder.Default
    private int maxEmailsPerCampaign = 100;

    @Column(name = "sending_delay_ms", nullable = false)
    @Builder.Default
    private long sendingDelayMs = 2000;

    @Column(name = "default_template_id")
    private UUID defaultTemplateId;

    @Column(name = "social_links", columnDefinition = "TEXT")
    private String socialLinks;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
