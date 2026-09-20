package com.careerreach.dto;

import com.careerreach.entity.EmailTemplate;
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
public class TemplateResponse {
    private UUID id;
    private String name;
    private String subject;
    private String body;
    private java.util.List<AttachmentDto> attachments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TemplateResponse fromEntity(EmailTemplate template) {
        java.util.List<AttachmentDto> attachmentDtos = template.getAttachments() != null
                ? template.getAttachments().stream().map(AttachmentDto::fromEntity).toList()
                : java.util.Collections.emptyList();

        return TemplateResponse.builder()
                .id(template.getId())
                .name(template.getName())
                .subject(template.getSubject())
                .body(template.getBody())
                .attachments(attachmentDtos)
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }
}
