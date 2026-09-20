package com.careerreach.service;

import com.careerreach.dto.*;
import com.careerreach.entity.Contact;
import com.careerreach.entity.ContactStatus;
import com.careerreach.entity.User;
import com.careerreach.exception.BadRequestException;
import com.careerreach.exception.DuplicateResourceException;
import com.careerreach.exception.ResourceNotFoundException;
import com.careerreach.repository.ContactRepository;
import com.careerreach.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;
    private final UserRepository userRepository;
    private final ExcelParserService excelParserService;

    @Transactional(readOnly = true)
    public ImportPreviewResponse previewImport(UUID userId, MultipartFile file) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return excelParserService.previewFile(file);
    }

    @Transactional
    public ImportSummaryDto importContacts(UUID userId, MultipartFile file) {
        return importContacts(userId, file, null);
    }

    @Transactional
    public ImportSummaryDto importContacts(UUID userId, MultipartFile file, java.util.Map<String, String> mapping) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ExcelParserService.ParseResult result = excelParserService.parseFile(user, file, mapping);

        if (!result.validContacts().isEmpty()) {
            contactRepository.saveAll(result.validContacts());
        }

        return result.summary();
    }

    @Transactional
    public ContactResponse createContact(UUID userId, ContactRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String email = request.getEmail().trim().toLowerCase();
        if (contactRepository.existsByUserIdAndEmailIgnoreCase(userId, email)) {
            throw new DuplicateResourceException("A contact with email " + email + " already exists in your list");
        }

        Contact contact = Contact.builder()
                .user(user)
                .name(request.getName() != null ? request.getName().trim() : "")
                .email(email)
                .company(request.getCompany() != null ? request.getCompany().trim() : "")
                .position(request.getPosition() != null ? request.getPosition().trim() : "")
                .status(request.getStatus() != null ? request.getStatus() : ContactStatus.READY)
                .build();

        contact = contactRepository.save(contact);
        return ContactResponse.fromEntity(contact);
    }

    @Transactional(readOnly = true)
    public PageResponse<ContactResponse> getContacts(
            UUID userId,
            ContactStatus status,
            String search,
            Pageable pageable) {

        String trimmedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<Contact> page = contactRepository.searchContacts(userId, status, trimmedSearch, pageable);

        List<ContactResponse> content = page.getContent().stream()
                .map(ContactResponse::fromEntity)
                .collect(Collectors.toList());

        return PageResponse.<ContactResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .isLast(page.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ContactResponse> getAllContactsForSelector(UUID userId) {
        return contactRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(ContactResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ContactResponse getContactById(UUID userId, UUID contactId) {
        Contact contact = contactRepository.findByIdAndUserId(contactId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
        return ContactResponse.fromEntity(contact);
    }

    @Transactional
    public ContactResponse updateContact(UUID userId, UUID contactId, ContactRequest request) {
        Contact contact = contactRepository.findByIdAndUserId(contactId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));

        String newEmail = request.getEmail().trim().toLowerCase();
        if (!contact.getEmail().equalsIgnoreCase(newEmail)) {
            if (contactRepository.existsByUserIdAndEmailIgnoreCase(userId, newEmail)) {
                throw new DuplicateResourceException("Another contact with email " + newEmail + " already exists");
            }
            contact.setEmail(newEmail);
        }

        contact.setName(request.getName() != null ? request.getName().trim() : "");
        contact.setCompany(request.getCompany() != null ? request.getCompany().trim() : "");
        contact.setPosition(request.getPosition() != null ? request.getPosition().trim() : "");
        if (request.getStatus() != null) {
            contact.setStatus(request.getStatus());
        }

        contact = contactRepository.save(contact);
        return ContactResponse.fromEntity(contact);
    }

    @Transactional
    public ContactResponse updateContactStatus(UUID userId, UUID contactId, ContactStatus status) {
        Contact contact = contactRepository.findByIdAndUserId(contactId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));

        contact.setStatus(status);
        contact = contactRepository.save(contact);

        return ContactResponse.fromEntity(contact);
    }

    @Transactional
    public void deleteContact(UUID userId, UUID contactId) {
        int deleted = contactRepository.deleteByIdAndUserId(contactId, userId);
        if (deleted == 0) {
            throw new ResourceNotFoundException("Contact not found or access denied");
        }
    }

    @Transactional
    public int bulkDeleteContacts(UUID userId, List<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new BadRequestException("No contact IDs provided for deletion");
        }
        return contactRepository.deleteByUserIdAndIdIn(userId, ids);
    }
}
