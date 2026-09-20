package com.careerreach.controller;

import com.careerreach.dto.*;
import com.careerreach.entity.ContactStatus;
import com.careerreach.security.UserPrincipal;
import com.careerreach.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @PostMapping(value = "/import/preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ImportPreviewResponse>> previewImport(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("file") MultipartFile file) {

        ImportPreviewResponse preview = contactService.previewImport(currentUser.getId(), file);
        return ResponseEntity.ok(ApiResponse.success("File preview generated successfully", preview));
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ImportSummaryDto>> importContacts(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "mapping", required = false) String mappingJson) {

        java.util.Map<String, String> columnMapping = null;
        if (mappingJson != null && !mappingJson.isBlank()) {
            try {
                columnMapping = objectMapper.readValue(
                        mappingJson,
                        new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, String>>() {}
                );
            } catch (Exception e) {
                // fall back to default auto-detection
            }
        }

        ImportSummaryDto summary = contactService.importContacts(currentUser.getId(), file, columnMapping);
        return ResponseEntity.ok(ApiResponse.success("Contacts imported successfully", summary));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ContactResponse>> updateContactStatus(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable("id") UUID id,
            @RequestParam("status") ContactStatus status) {

        ContactResponse contact = contactService.updateContactStatus(currentUser.getId(), id, status);
        return ResponseEntity.ok(ApiResponse.success("Contact status updated to " + status, contact));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ContactResponse>> createContact(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody ContactRequest request) {

        ContactResponse contact = contactService.createContact(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Contact created successfully", contact));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ContactResponse>>> getContacts(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(name = "direction", defaultValue = "desc") String direction,
            @RequestParam(name = "status", required = false) ContactStatus status,
            @RequestParam(name = "search", required = false) String search) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), sort);

        PageResponse<ContactResponse> contacts = contactService.getContacts(currentUser.getId(), status, search, pageable);
        return ResponseEntity.ok(ApiResponse.success("Contacts retrieved successfully", contacts));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<ContactResponse>>> getAllContacts(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        List<ContactResponse> contacts = contactService.getAllContactsForSelector(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("All contacts retrieved", contacts));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContactResponse>> getContactById(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id) {

        ContactResponse contact = contactService.getContactById(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Contact retrieved successfully", contact));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ContactResponse>> updateContact(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody ContactRequest request) {

        ContactResponse updated = contactService.updateContact(currentUser.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Contact updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteContact(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id) {

        contactService.deleteContact(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Contact deleted successfully"));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Integer>> bulkDeleteContacts(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody BulkDeleteRequest request) {

        int deletedCount = contactService.bulkDeleteContacts(currentUser.getId(), request.getIds());
        return ResponseEntity.ok(ApiResponse.success("Deleted " + deletedCount + " contacts successfully", deletedCount));
    }
}
