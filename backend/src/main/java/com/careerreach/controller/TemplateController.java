package com.careerreach.controller;

import com.careerreach.dto.*;
import com.careerreach.security.UserPrincipal;
import com.careerreach.service.TemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    @PostMapping
    public ResponseEntity<ApiResponse<TemplateResponse>> createTemplate(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody TemplateRequest request) {

        TemplateResponse template = templateService.createTemplate(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Template created successfully", template));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TemplateResponse>>> getTemplates(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(value = "search", required = false) String search) {

        List<TemplateResponse> templates = templateService.getTemplates(currentUser.getId(), search);
        return ResponseEntity.ok(ApiResponse.success("Templates retrieved successfully", templates));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<ApiResponse<TemplateResponse>> duplicateTemplate(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id) {

        TemplateResponse duplicated = templateService.duplicateTemplate(currentUser.getId(), id);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Template duplicated successfully", duplicated));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TemplateResponse>> getTemplateById(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id) {

        TemplateResponse template = templateService.getTemplateById(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Template retrieved successfully", template));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TemplateResponse>> updateTemplate(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody TemplateRequest request) {

        TemplateResponse updated = templateService.updateTemplate(currentUser.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Template updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTemplate(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id) {

        templateService.deleteTemplate(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Template deleted successfully"));
    }

    @PostMapping("/{id}/preview")
    public ResponseEntity<ApiResponse<TemplatePreviewResponse>> previewTemplate(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id,
            @RequestBody(required = false) TemplatePreviewRequest request) {

        TemplatePreviewResponse preview = templateService.previewTemplate(currentUser.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Template preview generated", preview));
    }
}
