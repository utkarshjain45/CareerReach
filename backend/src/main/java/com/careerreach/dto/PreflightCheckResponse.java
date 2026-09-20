package com.careerreach.dto;

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
public class PreflightCheckResponse {
    private boolean readyToSend;
    private boolean gmailConnected;
    private String gmailAccountEmail;

    private int totalRecipients;
    private int willSendCount;
    private int skippedCount;

    private int invalidEmailsCount;
    private int unsubscribedCount;
    private int duplicateCount;

    private List<UUID> eligibleContactIds;
    private List<String> skippedReasons;
    private List<String> validationErrors;
}
