package com.careerreach.service;

import com.careerreach.dto.TemplatePreviewRequest;
import com.careerreach.dto.TemplatePreviewResponse;
import com.careerreach.dto.TemplateRequest;
import com.careerreach.dto.TemplateResponse;
import com.careerreach.entity.Contact;
import com.careerreach.entity.EmailTemplate;
import com.careerreach.entity.User;
import com.careerreach.exception.ResourceNotFoundException;
import com.careerreach.repository.AttachmentRepository;
import com.careerreach.repository.ContactRepository;
import com.careerreach.repository.EmailTemplateRepository;
import com.careerreach.repository.UserRepository;
import com.careerreach.util.TemplateVariableUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final EmailTemplateRepository templateRepository;
    private final ContactRepository contactRepository;
    private final UserRepository userRepository;
    private final AttachmentRepository attachmentRepository;
    private final UserSettingsService userSettingsService;

    @Transactional
    public TemplateResponse createTemplate(UUID userId, TemplateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<com.careerreach.entity.Attachment> attachments = new java.util.ArrayList<>();
        if (request.getAttachmentIds() != null && !request.getAttachmentIds().isEmpty()) {
            attachments = attachmentRepository.findAllByIdInAndUserId(request.getAttachmentIds(), userId);
        }

        EmailTemplate template = EmailTemplate.builder()
                .user(user)
                .name(request.getName().trim())
                .subject(request.getSubject().trim())
                .body(request.getBody())
                .attachments(attachments)
                .build();

        template = templateRepository.save(template);

        return TemplateResponse.fromEntity(template);
    }

    @Transactional(readOnly = true)
    public List<TemplateResponse> getTemplates(UUID userId) {
        return getTemplates(userId, null);
    }

    @Transactional(readOnly = true)
    public List<TemplateResponse> getTemplates(UUID userId, String search) {
        List<EmailTemplate> templates;
        if (search != null && !search.trim().isEmpty()) {
            templates = templateRepository.searchByUserId(userId, search.trim());
        } else {
            templates = templateRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        }

        return templates.stream()
                .map(TemplateResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TemplateResponse getTemplateById(UUID userId, UUID templateId) {
        EmailTemplate template = templateRepository.findByIdAndUserId(templateId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));
        return TemplateResponse.fromEntity(template);
    }

    @Transactional
    public TemplateResponse updateTemplate(UUID userId, UUID templateId, TemplateRequest request) {
        EmailTemplate template = templateRepository.findByIdAndUserId(templateId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        template.setName(request.getName().trim());
        template.setSubject(request.getSubject().trim());
        template.setBody(request.getBody());

        if (request.getAttachmentIds() != null) {
            List<com.careerreach.entity.Attachment> attachments = request.getAttachmentIds().isEmpty()
                    ? new java.util.ArrayList<>()
                    : attachmentRepository.findAllByIdInAndUserId(request.getAttachmentIds(), userId);
            template.setAttachments(attachments);
        }

        template = templateRepository.save(template);
        return TemplateResponse.fromEntity(template);
    }

    @Transactional
    public TemplateResponse duplicateTemplate(UUID userId, UUID templateId) {
        EmailTemplate original = templateRepository.findByIdAndUserId(templateId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        List<com.careerreach.entity.Attachment> copiedAttachments = original.getAttachments() != null
                ? new java.util.ArrayList<>(original.getAttachments())
                : new java.util.ArrayList<>();

        EmailTemplate clone = EmailTemplate.builder()
                .user(original.getUser())
                .name("Copy of " + original.getName())
                .subject(original.getSubject())
                .body(original.getBody())
                .attachments(copiedAttachments)
                .build();

        clone = templateRepository.save(clone);

        return TemplateResponse.fromEntity(clone);
    }

    @Transactional
    public void deleteTemplate(UUID userId, UUID templateId) {
        int deleted = templateRepository.deleteByIdAndUserId(templateId, userId);
        if (deleted == 0) {
            throw new ResourceNotFoundException("Template not found or access denied");
        }
    }

    @Transactional(readOnly = true)
    public TemplatePreviewResponse previewTemplate(UUID userId, UUID templateId, TemplatePreviewRequest request) {
        EmailTemplate template = templateRepository.findByIdAndUserId(templateId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        String name = "Alex Morgan";
        String email = "alex.morgan@techcorp.com";
        String company = "TechCorp";
        String position = "Senior Engineering Manager";

        if (request != null && request.getContactId() != null) {
            Contact contact = contactRepository.findByIdAndUserId(request.getContactId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Selected contact not found in your account"));

            name = contact.getName() != null && !contact.getName().isBlank() ? contact.getName() : "Hiring Manager";
            email = contact.getEmail();
            company = contact.getCompany() != null && !contact.getCompany().isBlank() ? contact.getCompany() : "Your Company";
            position = contact.getPosition() != null && !contact.getPosition().isBlank() ? contact.getPosition() : "Role";
        } else if (request != null) {
            if (request.getCustomName() != null && !request.getCustomName().isBlank()) name = request.getCustomName();
            if (request.getCustomEmail() != null && !request.getCustomEmail().isBlank()) email = request.getCustomEmail();
            if (request.getCustomCompany() != null && !request.getCustomCompany().isBlank()) company = request.getCustomCompany();
            if (request.getCustomPosition() != null && !request.getCustomPosition().isBlank()) position = request.getCustomPosition();
        }

        java.util.Map<String, String> socialLinks = userSettingsService.getSocialLinksMap(userId);
        String renderedSubject = TemplateVariableUtil.interpolate(template.getSubject(), name, email, company, position, socialLinks);
        String renderedBody = TemplateVariableUtil.interpolate(template.getBody(), name, email, company, position, socialLinks);

        return TemplatePreviewResponse.builder()
                .toName(name)
                .toEmail(email)
                .company(company)
                .position(position)
                .subject(renderedSubject)
                .body(renderedBody)
                .isPreviewMode(true)
                .build();
    }
}
