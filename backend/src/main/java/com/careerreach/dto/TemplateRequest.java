package com.careerreach.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TemplateRequest {
    @NotBlank(message = "Template name is required")
    private String name;

    @NotBlank(message = "Subject line is required")
    private String subject;

    @NotBlank(message = "Email body is required")
    private String body;

    private java.util.List<java.util.UUID> attachmentIds;
}
