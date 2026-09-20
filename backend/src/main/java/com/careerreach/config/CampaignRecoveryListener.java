package com.careerreach.config;

import com.careerreach.entity.Campaign;
import com.careerreach.entity.CampaignStatus;
import com.careerreach.repository.CampaignRecipientRepository;
import com.careerreach.repository.CampaignRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CampaignRecoveryListener {

    private final CampaignRepository campaignRepository;
    private final CampaignRecipientRepository recipientRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void onApplicationReady() {
        log.info("Checking for orphaned campaigns from prior application lifecycle...");

        // 1. Reset any recipients stuck in SENDING status back to PENDING so they are not permanently lost
        int resetCount = recipientRepository.resetOrphanedSendingRecipients();
        if (resetCount > 0) {
            log.info("Reset {} recipient(s) stuck in SENDING state back to PENDING", resetCount);
        }

        // 2. Safely pause any campaigns that were actively running when the server stopped
        List<Campaign> orphaned = campaignRepository.findByStatusIn(List.of(CampaignStatus.RUNNING, CampaignStatus.QUEUED));
        for (Campaign campaign : orphaned) {
            campaign.setStatus(CampaignStatus.PAUSED);
            campaignRepository.save(campaign);
            log.info("Safely transitioned orphaned campaign '{}' ({}) to PAUSED state",
                    campaign.getName(), campaign.getId());
        }
    }
}
