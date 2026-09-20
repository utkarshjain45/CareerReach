package com.careerreach.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialLinkDto {

    private String id;

    @NotBlank(message = "Link name/platform is required")
    private String name;

    @NotBlank(message = "Link URL is required")
    private String url;
}
