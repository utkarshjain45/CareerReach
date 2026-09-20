package com.careerreach.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalContacts;
    private long contactsReady;
    private long totalTemplates;
    private long totalCampaigns;
    private long activeCampaigns;
    private long emailsSent;
    private long emailsFailed;
    private double successRate;

    private List<CampaignRecentDto> recentCampaigns;
}
