package com.careerreach.controller;

import com.careerreach.dto.*;
import com.careerreach.security.UserPrincipal;
import com.careerreach.service.UserSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class UserSettingsController {

    private final UserSettingsService settingsService;

    @GetMapping
    public ResponseEntity<ApiResponse<UserSettingsDto>> getSettings(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        UserSettingsDto settings = settingsService.getSettings(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("User settings retrieved", settings));
    }

    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse<UserSettingsDto>> updateSettings(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody UserSettingsDto dto) {
        UserSettingsDto updated = settingsService.updateSettings(currentUser.getId(), dto);
        return ResponseEntity.ok(ApiResponse.success("Sending preferences updated successfully", updated));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserDto updated = settingsService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody ChangePasswordRequest request) {
        settingsService.changePassword(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }
}
