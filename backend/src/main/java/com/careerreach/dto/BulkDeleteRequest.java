package com.careerreach.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class BulkDeleteRequest {
    @NotEmpty(message = "Contact IDs list cannot be empty")
    private List<UUID> ids;
}
