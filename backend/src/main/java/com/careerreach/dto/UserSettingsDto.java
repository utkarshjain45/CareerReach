package com.careerreach.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSettingsDto {

    @Min(value = 1, message = "Max emails per campaign must be at least 1")
    @Max(value = 500, message = "Max emails per campaign cannot exceed 500")
    @Builder.Default
    private int maxEmailsPerCampaign = 100;

    @Min(value = 1000, message = "Sending delay must be at least 1000ms (1s)")
    @Max(value = 30000, message = "Sending delay cannot exceed 30000ms (30s)")
    @Builder.Default
    private long sendingDelayMs = 2000;

    private UUID defaultTemplateId;

    @Builder.Default
    private java.util.List<SocialLinkDto> socialLinks = new java.util.ArrayList<>();
}
