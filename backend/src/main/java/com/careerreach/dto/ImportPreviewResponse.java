package com.careerreach.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportPreviewResponse {
    private List<String> headers;
    private Map<String, String> suggestedMapping;
    private List<Map<String, String>> previewRows;
    private int totalEstimatedRows;
}
