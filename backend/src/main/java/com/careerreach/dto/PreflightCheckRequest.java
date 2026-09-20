package com.careerreach.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PreflightCheckRequest {

    @NotNull(message = "Template ID is required")
    private UUID templateId;

    @NotEmpty(message = "Recipient contact IDs cannot be empty")
    private List<UUID> contactIds;

    @Builder.Default
    private boolean skipDuplicates = true;
}
