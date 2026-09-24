package com.careerreach.controller;

import com.careerreach.dto.ApiResponse;
import com.careerreach.dto.CampaignDetailResponse;
import com.careerreach.dto.CampaignResponse;
import com.careerreach.dto.CreateCampaignRequest;
import com.careerreach.security.UserPrincipal;
import com.careerreach.service.CampaignService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;

    @PostMapping
    public ResponseEntity<ApiResponse<CampaignResponse>> createCampaign(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CreateCampaignRequest request) {

        CampaignResponse campaign = campaignService.createCampaign(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Campaign created successfully", campaign));
    }

    @PostMapping("/check-duplicates")
    public ResponseEntity<ApiResponse<com.careerreach.dto.DuplicateCheckResponse>> checkDuplicates(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody com.careerreach.dto.DuplicateCheckRequest request) {

        com.careerreach.dto.DuplicateCheckResponse response =
                campaignService.checkDuplicates(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Duplicate check completed", response));
    }

    @PostMapping("/validate-preflight")
    public ResponseEntity<ApiResponse<com.careerreach.dto.PreflightCheckResponse>> validatePreflight(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody com.careerreach.dto.PreflightCheckRequest request) {

        com.careerreach.dto.PreflightCheckResponse response =
                campaignService.validatePreflight(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Preflight validation completed", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CampaignResponse>>> getCampaigns(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        List<CampaignResponse> campaigns = campaignService.getCampaigns(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Campaigns retrieved successfully", campaigns));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CampaignDetailResponse>> getCampaignById(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id) {

        CampaignDetailResponse detail = campaignService.getCampaignById(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Campaign details retrieved", detail));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<ApiResponse<CampaignResponse>> startCampaign(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id) {

        CampaignResponse campaign = campaignService.startCampaign(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Campaign started successfully", campaign));
    }

    @PostMapping("/{id}/pause")
    public ResponseEntity<ApiResponse<CampaignResponse>> pauseCampaign(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id) {

        CampaignResponse campaign = campaignService.pauseCampaign(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Campaign paused", campaign));
    }

    @PostMapping("/{id}/resume")
    public ResponseEntity<ApiResponse<CampaignResponse>> resumeCampaign(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id) {

        CampaignResponse campaign = campaignService.resumeCampaign(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Campaign resumed", campaign));
    }

    @PostMapping("/{id}/retry-failed")
    public ResponseEntity<ApiResponse<CampaignResponse>> retryFailed(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id) {

        CampaignResponse campaign = campaignService.retryFailedRecipients(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Retrying failed recipients", campaign));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<CampaignResponse>> cancelCampaign(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id) {

        CampaignResponse campaign = campaignService.cancelCampaign(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Campaign cancelled", campaign));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCampaign(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id) {

        campaignService.deleteCampaign(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Campaign deleted successfully"));
    }
}
