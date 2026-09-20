package com.careerreach.dto;

import com.careerreach.entity.Attachment;
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
public class AttachmentDto {
    private UUID id;
    private String originalFileName;
    private Long fileSize;
    private String contentType;
    private LocalDateTime createdAt;

    public static AttachmentDto fromEntity(Attachment attachment) {
        if (attachment == null) return null;
        return AttachmentDto.builder()
                .id(attachment.getId())
                .originalFileName(attachment.getOriginalFileName())
                .fileSize(attachment.getFileSize())
                .contentType(attachment.getContentType())
                .createdAt(attachment.getCreatedAt())
                .build();
    }
}
