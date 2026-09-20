package com.careerreach.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreateCampaignRequest {
    @NotBlank(message = "Campaign name is required")
    private String name;

    @NotNull(message = "Email template must be selected")
    private UUID templateId;

    private List<UUID> contactIds;
    private List<UUID> attachmentIds;
}
