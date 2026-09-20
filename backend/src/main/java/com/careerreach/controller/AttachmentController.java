package com.careerreach.controller;

import com.careerreach.dto.ApiResponse;
import com.careerreach.dto.AttachmentDto;
import com.careerreach.entity.Attachment;
import com.careerreach.security.UserPrincipal;
import com.careerreach.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AttachmentDto>> uploadAttachment(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("file") MultipartFile file
    ) {
        AttachmentDto dto = attachmentService.uploadAttachment(currentUser.getId(), file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resume attachment uploaded successfully", dto));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AttachmentDto>>> getAttachments(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        List<AttachmentDto> attachments = attachmentService.getUserAttachments(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Attachments retrieved successfully", attachments));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AttachmentDto>> getAttachmentById(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id
    ) {
        AttachmentDto dto = attachmentService.getAttachmentById(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Attachment details retrieved", dto));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadAttachment(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id
    ) {
        Attachment attachment = attachmentService.getAttachmentEntity(currentUser.getId(), id);
        byte[] fileData = attachmentService.downloadAttachmentData(currentUser.getId(), id);

        String encodedFilename = URLEncoder.encode(attachment.getOriginalFileName(), StandardCharsets.UTF_8)
                .replace("+", "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename*=UTF-8''" + encodedFilename)
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileData.length))
                .body(fileData);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAttachment(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id
    ) {
        attachmentService.deleteAttachment(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Attachment deleted successfully", null));
    }
}
