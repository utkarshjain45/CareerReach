package com.careerreach.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplatePreviewResponse {
    private String toEmail;
    private String toName;
    private String company;
    private String position;
    private String subject;
    private String body;
    private boolean isPreviewMode;
}
