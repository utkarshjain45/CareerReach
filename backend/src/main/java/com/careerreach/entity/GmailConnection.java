package com.careerreach.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "gmail_connections", indexes = {
    @Index(name = "idx_gmail_connections_user_id", columnList = "user_id", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GmailConnection {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "google_account_email", nullable = false)
    private String googleAccountEmail;

    @Column(name = "encrypted_access_token", columnDefinition = "TEXT", nullable = false)
    private String encryptedAccessToken;

    @Column(name = "encrypted_refresh_token", columnDefinition = "TEXT")
    private String encryptedRefreshToken;

    @Column(name = "token_expiry")
    private Instant tokenExpiry;

    @CreationTimestamp
    @Column(name = "connected_at", nullable = false, updatable = false)
    private LocalDateTime connectedAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
