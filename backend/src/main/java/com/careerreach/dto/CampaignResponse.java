package com.careerreach.dto;

import com.careerreach.entity.Campaign;
import com.careerreach.entity.CampaignStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignResponse {
    private UUID id;
    private String name;
    private UUID templateId;
    private String templateName;
    private CampaignStatus status;
    private int totalRecipients;
    private int sentCount;
    private int failedCount;
    private int pendingCount;
    private java.util.List<AttachmentDto> attachments;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CampaignResponse fromEntity(Campaign campaign) {
        int pending = Math.max(0, campaign.getTotalRecipients() - (campaign.getSentCount() + campaign.getFailedCount()));

        java.util.LinkedHashSet<AttachmentDto> allAttachments = new java.util.LinkedHashSet<>();
        if (campaign.getTemplate() != null && campaign.getTemplate().getAttachments() != null) {
            campaign.getTemplate().getAttachments().forEach(a -> allAttachments.add(AttachmentDto.fromEntity(a)));
        }
        if (campaign.getAttachments() != null) {
            campaign.getAttachments().forEach(a -> allAttachments.add(AttachmentDto.fromEntity(a)));
        }

        return CampaignResponse.builder()
                .id(campaign.getId())
                .name(campaign.getName())
                .templateId(campaign.getTemplate() != null ? campaign.getTemplate().getId() : null)
                .templateName(campaign.getTemplate() != null ? campaign.getTemplate().getName() : null)
                .status(campaign.getStatus())
                .totalRecipients(campaign.getTotalRecipients())
                .sentCount(campaign.getSentCount())
                .failedCount(campaign.getFailedCount())
                .pendingCount(pending)
                .attachments(new java.util.ArrayList<>(allAttachments))
                .startedAt(campaign.getStartedAt())
                .completedAt(campaign.getCompletedAt())
                .createdAt(campaign.getCreatedAt())
                .updatedAt(campaign.getUpdatedAt())
                .build();
    }
}
