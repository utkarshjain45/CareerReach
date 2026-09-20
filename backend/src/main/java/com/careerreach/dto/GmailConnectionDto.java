package com.careerreach.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GmailConnectionDto {
    private boolean connected;
    private String googleAccountEmail;
    private LocalDateTime connectedAt;
    private boolean tokenExpired;
}
