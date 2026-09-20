package com.careerreach.dto;

import com.careerreach.entity.CampaignRecipient;
import com.careerreach.entity.CampaignRecipientStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignRecipientResponse {
    private UUID id;
    private UUID contactId;
    private String contactName;
    private String contactEmail;
    private String contactCompany;
    private String contactPosition;
    private CampaignRecipientStatus status;
    private LocalDateTime sentAt;
    private String errorMessage;

    public static CampaignRecipientResponse fromEntity(CampaignRecipient recipient) {
        return CampaignRecipientResponse.builder()
                .id(recipient.getId())
                .contactId(recipient.getContact().getId())
                .contactName(recipient.getContact().getName())
                .contactEmail(recipient.getContact().getEmail())
                .contactCompany(recipient.getContact().getCompany())
                .contactPosition(recipient.getContact().getPosition())
                .status(recipient.getStatus())
                .sentAt(recipient.getSentAt())
                .errorMessage(recipient.getErrorMessage())
                .build();
    }
}
