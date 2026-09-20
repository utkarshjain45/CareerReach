package com.careerreach.dto;

import com.careerreach.entity.Contact;
import com.careerreach.entity.ContactStatus;
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
public class ContactResponse {
    private UUID id;
    private String name;
    private String email;
    private String company;
    private String position;
    private ContactStatus status;
    private String invalidReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ContactResponse fromEntity(Contact contact) {
        return ContactResponse.builder()
                .id(contact.getId())
                .name(contact.getName())
                .email(contact.getEmail())
                .company(contact.getCompany())
                .position(contact.getPosition())
                .status(contact.getStatus())
                .invalidReason(contact.getInvalidReason())
                .createdAt(contact.getCreatedAt())
                .updatedAt(contact.getUpdatedAt())
                .build();
    }
}
