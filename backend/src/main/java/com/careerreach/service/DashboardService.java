package com.careerreach.service;

import com.careerreach.dto.CampaignRecentDto;
import com.careerreach.dto.DashboardStatsResponse;
import com.careerreach.entity.Campaign;
import com.careerreach.entity.CampaignStatus;
import com.careerreach.entity.ContactStatus;
import com.careerreach.repository.CampaignRepository;
import com.careerreach.repository.ContactRepository;
import com.careerreach.repository.EmailTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ContactRepository contactRepository;
    private final EmailTemplateRepository templateRepository;
    private final CampaignRepository campaignRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats(UUID userId) {
        long totalContacts = contactRepository.countByUserId(userId);
        long contactsReady = contactRepository.countByUserIdAndStatus(userId, ContactStatus.READY);
        long totalTemplates = templateRepository.countByUserId(userId);
        long totalCampaigns = campaignRepository.countByUserId(userId);

        long activeCampaigns = campaignRepository.countByUserIdAndStatusIn(
                userId, List.of(CampaignStatus.RUNNING, CampaignStatus.QUEUED));

        long emailsSent = campaignRepository.sumSentCountByUserId(userId);
        long emailsFailed = campaignRepository.sumFailedCountByUserId(userId);

        long totalAttempted = emailsSent + emailsFailed;
        double overallSuccessRate = totalAttempted > 0
                ? Math.round(((double) emailsSent / totalAttempted * 100.0) * 10.0) / 10.0
                : 0.0;

        List<CampaignRecentDto> recentCampaigns = campaignRepository.findTop5ByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToRecentDto)
                .toList();

        return DashboardStatsResponse.builder()
                .totalContacts(totalContacts)
                .contactsReady(contactsReady)
                .totalTemplates(totalTemplates)
                .totalCampaigns(totalCampaigns)
                .activeCampaigns(activeCampaigns)
                .emailsSent(emailsSent)
                .emailsFailed(emailsFailed)
                .successRate(overallSuccessRate)
                .recentCampaigns(recentCampaigns)
                .build();
    }

    private CampaignRecentDto mapToRecentDto(Campaign campaign) {
        long attempted = campaign.getSentCount() + campaign.getFailedCount();
        double successRate = attempted > 0
                ? Math.round(((double) campaign.getSentCount() / attempted * 100.0) * 10.0) / 10.0
                : 0.0;

        return CampaignRecentDto.builder()
                .id(campaign.getId())
                .name(campaign.getName())
                .totalRecipients(campaign.getTotalRecipients())
                .sentCount(campaign.getSentCount())
                .failedCount(campaign.getFailedCount())
                .successRate(successRate)
                .status(campaign.getStatus())
                .createdAt(campaign.getCreatedAt())
                .completedAt(campaign.getCompletedAt())
                .build();
    }
}
