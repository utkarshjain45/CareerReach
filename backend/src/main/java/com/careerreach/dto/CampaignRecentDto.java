package com.careerreach.dto;

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
public class CampaignRecentDto {
    private UUID id;
    private String name;
    private int totalRecipients;
    private int sentCount;
    private int failedCount;
    private double successRate;
    private CampaignStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
