package com.careerreach.service;

import com.careerreach.dto.ChangePasswordRequest;
import com.careerreach.dto.UpdateProfileRequest;
import com.careerreach.dto.UserDto;
import com.careerreach.dto.UserSettingsDto;
import com.careerreach.entity.User;
import com.careerreach.entity.UserSettings;
import com.careerreach.exception.BadRequestException;
import com.careerreach.exception.ResourceNotFoundException;
import com.careerreach.repository.UserRepository;
import com.careerreach.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserSettingsService {

    private final UserSettingsRepository settingsRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public UserSettingsDto getSettings(UUID userId) {
        UserSettings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultSettings(userId));

        return UserSettingsDto.builder()
                .maxEmailsPerCampaign(settings.getMaxEmailsPerCampaign())
                .sendingDelayMs(settings.getSendingDelayMs())
                .defaultTemplateId(settings.getDefaultTemplateId())
                .socialLinks(parseSocialLinks(settings.getSocialLinks()))
                .build();
    }

    @Transactional
    public UserSettingsDto updateSettings(UUID userId, UserSettingsDto dto) {
        UserSettings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultSettings(userId));

        settings.setMaxEmailsPerCampaign(dto.getMaxEmailsPerCampaign());
        settings.setSendingDelayMs(dto.getSendingDelayMs());
        settings.setDefaultTemplateId(dto.getDefaultTemplateId());

        if (dto.getSocialLinks() != null) {
            try {
                settings.setSocialLinks(objectMapper.writeValueAsString(dto.getSocialLinks()));
            } catch (Exception e) {
                log.warn("Failed to serialize social links for user {}: {}", userId, e.getMessage());
            }
        }

        settingsRepository.save(settings);
        return dto;
    }

    public java.util.Map<String, String> getSocialLinksMap(UUID userId) {
        UserSettings settings = settingsRepository.findByUserId(userId).orElse(null);
        if (settings == null || settings.getSocialLinks() == null || settings.getSocialLinks().isBlank()) {
            return java.util.Collections.emptyMap();
        }

        java.util.List<com.careerreach.dto.SocialLinkDto> links = parseSocialLinks(settings.getSocialLinks());
        java.util.Map<String, String> map = new java.util.HashMap<>();
        for (var link : links) {
            if (link.getName() != null && !link.getName().isBlank() && link.getUrl() != null && !link.getUrl().isBlank()) {
                String cleanKey = link.getName().trim().toLowerCase().replaceAll("[^a-z0-9_]", "");
                if (!cleanKey.isBlank()) {
                    map.put(cleanKey, link.getUrl().trim());
                }
            }
        }
        return map;
    }

    private java.util.List<com.careerreach.dto.SocialLinkDto> parseSocialLinks(String json) {
        if (json == null || json.isBlank()) {
            return new java.util.ArrayList<>();
        }
        try {
            return objectMapper.readValue(
                    json,
                    objectMapper.getTypeFactory().constructCollectionType(java.util.List.class, com.careerreach.dto.SocialLinkDto.class)
            );
        } catch (Exception e) {
            log.warn("Failed to deserialize social links JSON: {}", e.getMessage());
            return new java.util.ArrayList<>();
        }
    }

    @Transactional
    public UserDto updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }

        user = userRepository.save(user);

        return UserDto.fromEntity(user);
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private UserSettings createDefaultSettings(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserSettings settings = UserSettings.builder()
                .user(user)
                .maxEmailsPerCampaign(100)
                .sendingDelayMs(2000)
                .build();

        return settingsRepository.save(settings);
    }
}
