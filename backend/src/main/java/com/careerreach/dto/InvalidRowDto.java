package com.careerreach.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvalidRowDto {
    private int rowNumber;
    private String name;
    private String email;
    private String company;
    private String position;
    private String reason;
}
