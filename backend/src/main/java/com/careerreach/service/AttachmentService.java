package com.careerreach.service;

import com.careerreach.dto.AttachmentDto;
import com.careerreach.entity.Attachment;
import com.careerreach.entity.Campaign;
import com.careerreach.entity.CampaignStatus;
import com.careerreach.entity.User;
import com.careerreach.exception.BadRequestException;
import com.careerreach.exception.ResourceNotFoundException;
import com.careerreach.repository.AttachmentRepository;
import com.careerreach.repository.CampaignRepository;
import com.careerreach.repository.UserRepository;
import com.careerreach.util.FileSanitizer;
import com.careerreach.util.PdfValidator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final StorageService storageService;
    private final CampaignDispatcher campaignDispatcher;
    private final long maxFileSize;

    public AttachmentService(
            AttachmentRepository attachmentRepository,
            UserRepository userRepository,
            CampaignRepository campaignRepository,
            StorageService storageService,
            CampaignDispatcher campaignDispatcher,
            @Value("${supabase.max-file-size:5242880}") long maxFileSize
    ) {
        this.attachmentRepository = attachmentRepository;
        this.userRepository = userRepository;
        this.campaignRepository = campaignRepository;
        this.storageService = storageService;
        this.campaignDispatcher = campaignDispatcher;
        this.maxFileSize = maxFileSize;
    }

    @Transactional
    public AttachmentDto uploadAttachment(UUID userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 1. Validate PDF file
        PdfValidator.validate(file, maxFileSize);

        // 2. Sanitize original filename
        String sanitizedName = FileSanitizer.sanitizeFilename(file.getOriginalFilename());

        // 3. Generate secure storage path: {userId}/resume/{uuid}.pdf
        UUID attachmentUuid = UUID.randomUUID();
        String storagePath = userId + "/resume/" + attachmentUuid + ".pdf";

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new BadRequestException("Failed to read file contents: " + e.getMessage());
        }

        // 4. Upload to private Supabase Storage
        storageService.upload(storagePath, bytes, "application/pdf");

        // 5. Save metadata to PostgreSQL with compensating rollback on failure
        Attachment attachment = Attachment.builder()
                .user(user)
                .originalFileName(sanitizedName)
                .storagePath(storagePath)
                .contentType("application/pdf")
                .fileSize((long) bytes.length)
                .build();

        try {
            attachment = attachmentRepository.save(attachment);
        } catch (Exception e) {
            log.error("Failed to save attachment metadata for path '{}', triggering compensating storage delete", storagePath, e);
            try {
                storageService.delete(storagePath);
            } catch (Exception cleanupEx) {
                log.error("Failed to delete orphaned file '{}' from storage: {}", storagePath, cleanupEx.getMessage());
            }
            throw e;
        }

        return AttachmentDto.fromEntity(attachment);
    }

    @Transactional(readOnly = true)
    public List<AttachmentDto> getUserAttachments(UUID userId) {
        return attachmentRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(AttachmentDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public AttachmentDto getAttachmentById(UUID userId, UUID attachmentId) {
        Attachment attachment = attachmentRepository.findByIdAndUserId(attachmentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));
        return AttachmentDto.fromEntity(attachment);
    }

    @Transactional(readOnly = true)
    public Attachment getAttachmentEntity(UUID userId, UUID attachmentId) {
        return attachmentRepository.findByIdAndUserId(attachmentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));
    }

    @Transactional(readOnly = true)
    public byte[] downloadAttachmentData(UUID userId, UUID attachmentId) {
        Attachment attachment = getAttachmentEntity(userId, attachmentId);
        return storageService.download(attachment.getStoragePath());
    }

    @Transactional
    public void deleteAttachment(UUID userId, UUID attachmentId) {
        Attachment attachment = attachmentRepository.findByIdAndUserId(attachmentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));

        // Guard against deleting attachments used by active running campaigns
        boolean inRunningDirect = campaignRepository.existsByAttachmentIdAndStatus(attachmentId, CampaignStatus.RUNNING);
        boolean inRunningTemplate = campaignRepository.existsByTemplateAttachmentIdAndStatus(attachmentId, CampaignStatus.RUNNING);

        if (inRunningDirect || inRunningTemplate) {
            boolean activelyDispatching = false;
            List<Campaign> running = campaignRepository.findByStatusIn(List.of(CampaignStatus.RUNNING));
            for (Campaign c : running) {
                if (campaignDispatcher.isActivelyDispatching(c.getId())) {
                    activelyDispatching = true;
                    break;
                }
            }
            if (activelyDispatching) {
                throw new BadRequestException("Cannot delete attachment because it is being used by an actively running campaign. Please pause or cancel the campaign first.");
            }
        }

        String storagePath = attachment.getStoragePath();

        // 1. Remove join table associations so foreign key constraints do not fail
        attachmentRepository.deleteFromCampaignAttachments(attachmentId);
        attachmentRepository.deleteFromTemplateAttachments(attachmentId);

        // 2. Delete from database
        attachmentRepository.delete(attachment);

        // 3. Delete from Supabase Storage
        try {
            storageService.delete(storagePath);
        } catch (Exception e) {
            log.warn("Storage deletion warning for path '{}': {}", storagePath, e.getMessage());
        }
    }
}
