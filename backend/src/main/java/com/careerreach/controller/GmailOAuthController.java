package com.careerreach.controller;

import com.careerreach.dto.ApiResponse;
import com.careerreach.dto.GmailAuthUrlResponse;
import com.careerreach.dto.GmailConnectionDto;
import com.careerreach.dto.OAuthCallbackRequest;
import com.careerreach.security.UserPrincipal;
import com.careerreach.service.GmailOAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gmail")
@RequiredArgsConstructor
public class GmailOAuthController {

    private final GmailOAuthService gmailOAuthService;

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<GmailConnectionDto>> getStatus(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        GmailConnectionDto status = gmailOAuthService.getConnectionStatus(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Gmail connection status", status));
    }

    @GetMapping("/auth-url")
    public ResponseEntity<ApiResponse<GmailAuthUrlResponse>> getAuthUrl(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        String authUrl = gmailOAuthService.generateAuthUrl(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Generated Google OAuth URL",
                GmailAuthUrlResponse.builder().authUrl(authUrl).build()));
    }

    @PostMapping("/oauth/callback")
    public ResponseEntity<ApiResponse<GmailConnectionDto>> handleCallback(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody OAuthCallbackRequest request) {

        GmailConnectionDto connection = gmailOAuthService.handleOAuthCallback(currentUser.getId(), request.getCode());
        return ResponseEntity.ok(ApiResponse.success("Gmail account connected successfully", connection));
    }

    @PostMapping("/disconnect")
    public ResponseEntity<ApiResponse<Void>> disconnect(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        gmailOAuthService.disconnect(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Gmail account disconnected successfully"));
    }
}
