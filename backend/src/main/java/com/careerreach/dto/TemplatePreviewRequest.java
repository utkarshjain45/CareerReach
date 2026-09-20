package com.careerreach.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class TemplatePreviewRequest {
    private UUID contactId;
    private String customName;
    private String customEmail;
    private String customCompany;
    private String customPosition;
}
