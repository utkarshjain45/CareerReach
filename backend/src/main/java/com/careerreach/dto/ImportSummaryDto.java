package com.careerreach.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportSummaryDto {
    private int totalRows;
    private int importedCount;
    private int validCount;
    private int invalidCount;
    private int duplicateCount;

    @Builder.Default
    private List<InvalidRowDto> invalidRows = new ArrayList<>();
}
