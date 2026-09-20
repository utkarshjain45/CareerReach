package com.careerreach.dto;

import jakarta.validation.constraints.NotEmpty;
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
public class DuplicateCheckRequest {
    private UUID templateId;

    @NotEmpty(message = "Contact IDs list cannot be empty")
    private List<UUID> contactIds;
}
