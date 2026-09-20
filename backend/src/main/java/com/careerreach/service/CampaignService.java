package com.careerreach.service;

import com.careerreach.dto.*;
import com.careerreach.entity.*;
import com.careerreach.exception.BadRequestException;
import com.careerreach.exception.ResourceNotFoundException;
import com.careerreach.repository.*;
import com.careerreach.util.TemplateVariableUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final CampaignRecipientRepository recipientRepository;
    private final EmailTemplateRepository templateRepository;
    private final ContactRepository contactRepository;
    private final UserRepository userRepository;
    private final GmailConnectionRepository gmailConnectionRepository;
    private final AttachmentRepository attachmentRepository;
    private final CampaignDispatcher campaignDispatcher;

    @Transactional(readOnly = true)
    public DuplicateCheckResponse checkDuplicates(UUID userId, DuplicateCheckRequest request) {
        if (request.getContactIds() == null || request.getContactIds().isEmpty()) {
            return DuplicateCheckResponse.builder()
                    .duplicateCount(0)
                    .duplicateContactIds(Collections.emptyList())
                    .warningMessage(null)
                    .build();
        }

        List<UUID> dupIds;
        if (request.getTemplateId() != null) {
            dupIds = recipientRepository.findSentContactIdsByTemplate(userId, request.getTemplateId(), request.getContactIds());
        } else {
            dupIds = recipientRepository.findSentContactIdsAny(userId, request.getContactIds());
        }

        String warning = null;
        if (!dupIds.isEmpty()) {
            warning = dupIds.size() + " contact" + (dupIds.size() > 1 ? "s have" : " has") +
                    " already received outreach with this template.";
        }

        return DuplicateCheckResponse.builder()
                .duplicateCount(dupIds.size())
                .duplicateContactIds(dupIds)
                .warningMessage(warning)
                .build();
    }

    @Transactional(readOnly = true)
    public PreflightCheckResponse validatePreflight(UUID userId, PreflightCheckRequest request) {
        List<String> validationErrors = new ArrayList<>();
        List<String> skippedReasons = new ArrayList<>();

        // 1. Gmail Connection check
        var gmailConnOpt = gmailConnectionRepository.findByUserId(userId);
        boolean gmailConnected = gmailConnOpt.isPresent();
        String gmailEmail = gmailConnOpt.map(GmailConnection::getGoogleAccountEmail).orElse(null);

        if (!gmailConnected) {
            validationErrors.add("No Gmail account is connected. Please connect your Gmail account.");
        }

        // 2. Template check
        EmailTemplate template = templateRepository.findByIdAndUserId(request.getTemplateId(), userId)
                .orElse(null);
        if (template == null) {
            validationErrors.add("Selected template could not be found.");
        } else {
            if (template.getSubject() == null || template.getSubject().isBlank()) {
                validationErrors.add("Template subject cannot be empty.");
            }
            if (template.getBody() == null || template.getBody().isBlank()) {
                validationErrors.add("Template email body cannot be empty.");
            }
        }

        // 3. Contacts check
        List<Contact> targetContacts = contactRepository.findAllById(request.getContactIds()).stream()
                .filter(c -> c.getUser().getId().equals(userId))
                .toList();

        int totalRecipients = targetContacts.size();
        if (totalRecipients == 0) {
            validationErrors.add("No recipients selected for this campaign.");
        }

        Set<UUID> duplicateIds = new HashSet<>();
        if (request.isSkipDuplicates() && template != null) {
            duplicateIds.addAll(recipientRepository.findSentContactIdsByTemplate(
                    userId, template.getId(), request.getContactIds()));
        }

        List<UUID> eligibleIds = new ArrayList<>();
        int invalidCount = 0;
        int unsubscribedCount = 0;
        int duplicateCount = 0;

        for (Contact contact : targetContacts) {
            if (contact.getStatus() == ContactStatus.UNSUBSCRIBED) {
                unsubscribedCount++;
            } else if (contact.getEmail() == null || contact.getEmail().isBlank() || contact.getStatus() == ContactStatus.INVALID) {
                invalidCount++;
            } else if (duplicateIds.contains(contact.getId())) {
                duplicateCount++;
            } else {
                eligibleIds.add(contact.getId());
            }
        }

        if (invalidCount > 0) {
            skippedReasons.add(invalidCount + " invalid email address" + (invalidCount > 1 ? "es" : ""));
        }
        if (unsubscribedCount > 0) {
            skippedReasons.add(unsubscribedCount + " unsubscribed contact" + (unsubscribedCount > 1 ? "s" : ""));
        }
        if (duplicateCount > 0) {
            skippedReasons.add(duplicateCount + " previously contacted recipient" + (duplicateCount > 1 ? "s" : ""));
        }

        int skippedCount = invalidCount + unsubscribedCount + duplicateCount;
        int willSendCount = eligibleIds.size();

        if (willSendCount == 0 && totalRecipients > 0) {
            validationErrors.add("All selected contacts are either invalid, unsubscribed, or duplicates.");
        }

        boolean readyToSend = validationErrors.isEmpty() && willSendCount > 0;

        return PreflightCheckResponse.builder()
                .readyToSend(readyToSend)
                .gmailConnected(gmailConnected)
                .gmailAccountEmail(gmailEmail)
                .totalRecipients(totalRecipients)
                .willSendCount(willSendCount)
                .skippedCount(skippedCount)
                .invalidEmailsCount(invalidCount)
                .unsubscribedCount(unsubscribedCount)
                .duplicateCount(duplicateCount)
                .eligibleContactIds(eligibleIds)
                .skippedReasons(skippedReasons)
                .validationErrors(validationErrors)
                .build();
    }

    @Transactional
    public CampaignResponse createCampaign(UUID userId, CreateCampaignRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        EmailTemplate template = templateRepository.findByIdAndUserId(request.getTemplateId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Selected email template not found"));

        List<Contact> targetContacts;
        if (request.getContactIds() != null && !request.getContactIds().isEmpty()) {
            targetContacts = contactRepository.findAllById(request.getContactIds()).stream()
                    .filter(c -> c.getUser().getId().equals(userId))
                    .collect(Collectors.toList());
        } else {
            targetContacts = contactRepository.searchContacts(userId, ContactStatus.READY, null,
                    org.springframework.data.domain.Pageable.unpaged()).getContent();
        }

        if (targetContacts.isEmpty()) {
            throw new BadRequestException("Cannot create a campaign with 0 recipients. Please select or import ready contacts.");
        }

        List<com.careerreach.entity.Attachment> campaignAttachments = new java.util.ArrayList<>();
        if (request.getAttachmentIds() != null && !request.getAttachmentIds().isEmpty()) {
            campaignAttachments = attachmentRepository.findAllByIdInAndUserId(request.getAttachmentIds(), userId);
        }

        Campaign campaign = Campaign.builder()
                .user(user)
                .name(request.getName().trim())
                .template(template)
                .attachments(campaignAttachments)
                .status(CampaignStatus.DRAFT)
                .totalRecipients(targetContacts.size())
                .sentCount(0)
                .failedCount(0)
                .build();

        campaign = campaignRepository.save(campaign);

        List<CampaignRecipient> recipients = new ArrayList<>();
        for (Contact contact : targetContacts) {
            CampaignRecipientStatus status = CampaignRecipientStatus.PENDING;
            String errorMsg = null;

            if (contact.getStatus() == ContactStatus.UNSUBSCRIBED) {
                status = CampaignRecipientStatus.SKIPPED;
                errorMsg = "Contact is marked as UNSUBSCRIBED";
            }

            CampaignRecipient recipient = CampaignRecipient.builder()
                    .campaign(campaign)
                    .contact(contact)
                    .status(status)
                    .errorMessage(errorMsg)
                    .build();
            recipients.add(recipient);
        }

        recipientRepository.saveAll(recipients);

        return CampaignResponse.fromEntity(campaign);
    }

    @Transactional(readOnly = true)
    public List<CampaignResponse> getCampaigns(UUID userId) {
        return campaignRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(CampaignResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CampaignDetailResponse getCampaignById(UUID userId, UUID campaignId) {
        Campaign campaign = campaignRepository.findByIdAndUserId(campaignId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found"));

        List<CampaignRecipientResponse> recipients = recipientRepository.findByCampaignIdOrderByStatusAsc(campaignId).stream()
                .map(CampaignRecipientResponse::fromEntity)
                .collect(Collectors.toList());

        return CampaignDetailResponse.builder()
                .campaign(CampaignResponse.fromEntity(campaign))
                .recipients(recipients)
                .build();
    }

    @Transactional
    public CampaignResponse startCampaign(UUID userId, UUID campaignId) {
        Campaign campaign = campaignRepository.findByIdAndUserId(campaignId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found"));

        if (!gmailConnectionRepository.existsByUserId(userId)) {
            throw new BadRequestException("Please connect your Gmail account before launching a campaign.");
        }

        if (campaign.getStatus() == CampaignStatus.RUNNING) {
            throw new BadRequestException("Campaign is already running.");
        }

        if (campaign.getStatus() == CampaignStatus.COMPLETED) {
            throw new BadRequestException("Campaign has already completed.");
        }

        campaign.setStatus(CampaignStatus.RUNNING);
        if (campaign.getStartedAt() == null) {
            campaign.setStartedAt(LocalDateTime.now());
        }

        campaign = campaignRepository.saveAndFlush(campaign);

        // Launch async dispatcher AFTER database transaction commits
        triggerAsyncDispatch(campaign.getId());

        return CampaignResponse.fromEntity(campaign);
    }

    @Transactional
    public CampaignResponse pauseCampaign(UUID userId, UUID campaignId) {
        Campaign campaign = campaignRepository.findByIdAndUserId(campaignId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found"));

        if (campaign.getStatus() != CampaignStatus.RUNNING) {
            throw new BadRequestException("Only running campaigns can be paused.");
        }

        campaign.setStatus(CampaignStatus.PAUSED);
        campaign = campaignRepository.saveAndFlush(campaign);

        return CampaignResponse.fromEntity(campaign);
    }

    @Transactional
    public CampaignResponse resumeCampaign(UUID userId, UUID campaignId) {
        Campaign campaign = campaignRepository.findByIdAndUserId(campaignId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found"));

        if (campaign.getStatus() != CampaignStatus.PAUSED) {
            throw new BadRequestException("Only paused campaigns can be resumed.");
        }

        campaign.setStatus(CampaignStatus.RUNNING);
        campaign = campaignRepository.saveAndFlush(campaign);

        // Resume async dispatcher AFTER database transaction commits
        triggerAsyncDispatch(campaign.getId());

        return CampaignResponse.fromEntity(campaign);
    }

    private void triggerAsyncDispatch(UUID campaignId) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    log.info("Transaction committed for campaign {}, triggering async dispatcher", campaignId);
                    campaignDispatcher.dispatch(campaignId);
                }
            });
        } else {
            campaignDispatcher.dispatch(campaignId);
        }
    }

    @Transactional
    public CampaignResponse cancelCampaign(UUID userId, UUID campaignId) {
        Campaign campaign = campaignRepository.findByIdAndUserId(campaignId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found"));

        if (campaign.getStatus() == CampaignStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed campaign.");
        }

        campaign.setStatus(CampaignStatus.FAILED);
        campaign.setCompletedAt(LocalDateTime.now());
        campaign = campaignRepository.save(campaign);

        // Mark remaining pending recipients as SKIPPED
        List<CampaignRecipient> pending = recipientRepository.findByCampaignIdAndStatus(campaignId, CampaignRecipientStatus.PENDING);
        for (CampaignRecipient r : pending) {
            r.setStatus(CampaignRecipientStatus.SKIPPED);
            r.setErrorMessage("Campaign cancelled by user");
        }
        recipientRepository.saveAll(pending);

        return CampaignResponse.fromEntity(campaign);
    }

    @Transactional
    public void deleteCampaign(UUID userId, UUID campaignId) {
        Campaign campaign = campaignRepository.findByIdAndUserId(campaignId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found"));

        if (campaign.getStatus() == CampaignStatus.RUNNING) {
            throw new BadRequestException("Cannot delete a running campaign. Please pause or cancel it first.");
        }

        campaignRepository.deleteByIdAndUserId(campaignId, userId);
    }
}
