package com.careerreach.service;

import com.careerreach.dto.EmailAttachmentPayload;
import com.careerreach.entity.*;
import com.careerreach.repository.CampaignRecipientRepository;
import com.careerreach.repository.CampaignRepository;
import com.careerreach.repository.ContactRepository;
import com.careerreach.repository.UserSettingsRepository;
import com.careerreach.util.TemplateVariableUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class CampaignDispatcher {

    private final CampaignRepository campaignRepository;
    private final CampaignRecipientRepository recipientRepository;
    private final ContactRepository contactRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final GmailSenderService gmailSenderService;
    private final StorageService storageService;
    private final UserSettingsService userSettingsService;
    private final com.careerreach.repository.AttachmentRepository attachmentRepository;

    private final Set<UUID> activeCampaignIds = java.util.concurrent.ConcurrentHashMap.newKeySet();

    public boolean isActivelyDispatching(UUID campaignId) {
        return activeCampaignIds.contains(campaignId);
    }

    @Value("${app.campaign.delay-ms:2000}")
    private long baseDelayMs;

    private final Random random = new Random();

    @Async("campaignTaskExecutor")
    public void dispatch(UUID campaignId) {
        if (!activeCampaignIds.add(campaignId)) {
            log.info("Campaign {} is already being dispatched by another thread, skipping", campaignId);
            return;
        }

        try {
            log.info("Starting background dispatching for campaign: {}", campaignId);

            // Ensure database write has committed and is visible across thread connections
            Campaign campaign = null;
            for (int i = 0; i < 5; i++) {
                campaign = campaignRepository.findByIdWithDetails(campaignId).orElse(null);
                if (campaign != null && campaign.getStatus() == CampaignStatus.RUNNING) {
                    break;
                }
                try {
                    Thread.sleep(150);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }

            if (campaign == null) {
                log.warn("Campaign {} not found after retries, terminating dispatcher", campaignId);
                return;
            }

            if (campaign.getStatus() != CampaignStatus.RUNNING) {
                log.info("Campaign {} is not in RUNNING state (status={}), terminating dispatch loop",
                        campaignId, campaign.getStatus());
                return;
            }

            // Resolve all distinct attachments across template and campaign levels safely without lazy proxy access
            List<EmailAttachmentPayload> attachmentPayloads = new ArrayList<>();
            String attachmentRetrievalError = null;
            Map<String, String> socialLinks = userSettingsService.getSocialLinksMap(campaign.getUser().getId());

            Map<UUID, Attachment> distinctAttachments = new LinkedHashMap<>();
            try {
                if (campaign.getTemplate() != null) {
                    List<Attachment> templateAtts = attachmentRepository.findByTemplateId(campaign.getTemplate().getId());
                    for (Attachment att : templateAtts) {
                        distinctAttachments.put(att.getId(), att);
                    }
                }
                List<Attachment> campaignAtts = attachmentRepository.findByCampaignId(campaignId);
                for (Attachment att : campaignAtts) {
                    distinctAttachments.put(att.getId(), att);
                }
            } catch (Exception e) {
                log.error("Failed to query attachments for campaign {}: {}", campaignId, e.getMessage(), e);
            }

            if (!distinctAttachments.isEmpty()) {
                log.info("Campaign {} has {} distinct attachments. Pre-fetching from storage...",
                        campaignId, distinctAttachments.size());
                for (Attachment att : distinctAttachments.values()) {
                    try {
                        byte[] data = storageService.download(att.getStoragePath());
                        attachmentPayloads.add(EmailAttachmentPayload.builder()
                                .fileName(att.getOriginalFileName())
                                .contentType(att.getContentType())
                                .data(data)
                                .build());
                    } catch (Exception e) {
                        log.error("Failed to download attachment '{}' from storage for campaign {}: {}",
                                att.getOriginalFileName(), campaignId, e.getMessage());
                        attachmentRetrievalError = "Attachment '" + att.getOriginalFileName() +
                                "' could not be retrieved from storage. Email was not sent.";
                        break;
                    }
                }
            }

            try {
                while (true) {
                    campaign = campaignRepository.findByIdWithDetails(campaignId).orElse(null);
                    if (campaign == null) {
                        log.warn("Campaign {} not found, terminating dispatcher", campaignId);
                        break;
                    }

                    // Check if campaign was paused or cancelled mid-execution
                    if (campaign.getStatus() != CampaignStatus.RUNNING) {
                        log.info("Campaign {} is no longer in RUNNING state (status={}), terminating dispatch loop",
                                campaignId, campaign.getStatus());
                        break;
                    }

                    List<CampaignRecipient> pendingList = recipientRepository.findByCampaignIdAndStatusWithDetails(
                            campaignId, CampaignRecipientStatus.PENDING);

                    if (pendingList.isEmpty()) {
                        log.info("Campaign {} has no more pending recipients, finalizing status", campaignId);
                        if (campaign.getSentCount() == 0 && campaign.getFailedCount() > 0) {
                            campaign.setStatus(CampaignStatus.FAILED);
                        } else {
                            campaign.setStatus(CampaignStatus.COMPLETED);
                        }
                        campaign.setCompletedAt(LocalDateTime.now());
                        campaignRepository.save(campaign);
                        break;
                    }

                    CampaignRecipient recipient = pendingList.get(0);
                    try {
                        processRecipient(campaign, recipient, attachmentPayloads, attachmentRetrievalError, socialLinks);
                    } catch (Exception e) {
                        log.error("Unexpected error processing recipient {} for campaign {}: {}",
                                recipient.getId(), campaignId, e.getMessage(), e);
                        try {
                            recipient.setStatus(CampaignRecipientStatus.FAILED);
                            recipient.setErrorMessage("Dispatch error: " + (e.getMessage() != null ? e.getMessage() : "Unknown error"));
                            recipientRepository.save(recipient);
                            campaign.setFailedCount(campaign.getFailedCount() + 1);
                            campaignRepository.save(campaign);
                        } catch (Exception ex) {
                            log.error("Failed to update status for recipient {}", recipient.getId(), ex);
                        }
                    }

                    // Determine rate-limit delay (respecting user preference if configured)
                    long delay = baseDelayMs;
                    try {
                        var settings = userSettingsRepository.findByUserId(campaign.getUser().getId());
                        if (settings.isPresent() && settings.get().getSendingDelayMs() >= 1000) {
                            delay = settings.get().getSendingDelayMs();
                        }
                    } catch (Exception ignored) {}

                    try {
                        long jitter = random.nextInt(600);
                        Thread.sleep(delay + jitter);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        log.warn("Campaign dispatcher interrupted for campaign {}", campaignId, e);
                        break;
                    }
                }
            } finally {
                // Clean up pre-fetched memory resources
                attachmentPayloads.clear();
            }

        } catch (Throwable t) {
            log.error("Fatal error during dispatch execution for campaign {}: {}", campaignId, t.getMessage(), t);
            try {
                campaignRepository.findById(campaignId).ifPresent(c -> {
                    if (c.getStatus() == CampaignStatus.RUNNING) {
                        c.setStatus(CampaignStatus.FAILED);
                        c.setCompletedAt(LocalDateTime.now());
                        campaignRepository.save(c);
                    }
                });
            } catch (Exception ignored) {}
        } finally {
            activeCampaignIds.remove(campaignId);
        }
    }

    @Transactional
    public void processRecipient(Campaign campaign, CampaignRecipient recipient,
                                 List<EmailAttachmentPayload> attachments, String attachmentError,
                                 Map<String, String> socialLinks) {
        recipient.setStatus(CampaignRecipientStatus.SENDING);
        recipientRepository.save(recipient);

        Contact contact = recipient.getContact();
        EmailTemplate template = campaign.getTemplate();

        // 1. Safety check: invalid email
        if (contact.getEmail() == null || contact.getEmail().isBlank()) {
            recipient.setStatus(CampaignRecipientStatus.FAILED);
            recipient.setErrorMessage("Recipient has no valid email address");
            recipientRepository.save(recipient);
            campaign.setFailedCount(campaign.getFailedCount() + 1);
            campaignRepository.save(campaign);
            return;
        }

        // 2. Safety check: contact is marked as UNSUBSCRIBED
        if (contact.getStatus() == ContactStatus.UNSUBSCRIBED) {
            recipient.setStatus(CampaignRecipientStatus.SKIPPED);
            recipient.setErrorMessage("Contact is unsubscribed; outreach skipped");
            recipientRepository.save(recipient);
            return;
        }

        // 3. Safety check: Attachment retrieval failure (do NOT silently send without requested attachment)
        if (attachmentError != null) {
            recipient.setStatus(CampaignRecipientStatus.FAILED);
            recipient.setErrorMessage(attachmentError);
            recipientRepository.save(recipient);
            campaign.setFailedCount(campaign.getFailedCount() + 1);
            campaignRepository.save(campaign);
            return;
        }

        try {
            String subject = TemplateVariableUtil.interpolate(
                    template.getSubject(),
                    contact.getName(),
                    contact.getEmail(),
                    contact.getCompany(),
                    contact.getPosition(),
                    socialLinks
            );

            String body = TemplateVariableUtil.interpolate(
                    template.getBody(),
                    contact.getName(),
                    contact.getEmail(),
                    contact.getCompany(),
                    contact.getPosition(),
                    socialLinks
            );

            // Execute send with transient retry logic and attachments
            sendWithRetry(campaign.getUser().getId(), contact.getEmail(), subject, body, attachments);

            recipient.setStatus(CampaignRecipientStatus.SENT);
            recipient.setSentAt(LocalDateTime.now());
            recipient.setErrorMessage(null);
            recipientRepository.save(recipient);

            campaign.setSentCount(campaign.getSentCount() + 1);
            campaignRepository.save(campaign);

            // Update contact status to SENT
            contact.setStatus(ContactStatus.SENT);
            contactRepository.save(contact);

        } catch (Exception e) {
            log.error("Failed to send campaign email to {}: {}", contact.getEmail(), e.getMessage());
            recipient.setStatus(CampaignRecipientStatus.FAILED);
            recipient.setErrorMessage(e.getMessage());
            recipientRepository.save(recipient);

            campaign.setFailedCount(campaign.getFailedCount() + 1);
            campaignRepository.save(campaign);
        }
    }

    private void sendWithRetry(UUID userId, String to, String subject, String body,
                               List<EmailAttachmentPayload> attachments) throws Exception {
        int maxAttempts = 3;
        Exception lastException = null;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                gmailSenderService.sendEmail(userId, to, subject, body, attachments);
                return; // Successful dispatch
            } catch (Exception e) {
                lastException = e;
                String msg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";

                // Transient errors: 429 Too Many Requests, 503 Service Unavailable, timeout
                boolean isTransient = msg.contains("429") || msg.contains("503") ||
                        msg.contains("timeout") || msg.contains("rate limit") || msg.contains("connection reset");

                if (!isTransient || attempt == maxAttempts) {
                    throw e; // Permanent error or reached max retries
                }

                log.warn("Transient error sending email to {} (attempt {}/{}): {}. Retrying after backoff...",
                        to, attempt, maxAttempts, e.getMessage());
                try {
                    Thread.sleep(attempt * 1500L);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw e;
                }
            }
        }

        if (lastException != null) throw lastException;
    }
}
