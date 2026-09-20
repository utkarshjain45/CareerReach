package com.careerreach;

import com.careerreach.dto.*;
import com.careerreach.entity.*;
import com.careerreach.exception.DuplicateResourceException;
import com.careerreach.exception.ResourceNotFoundException;
import com.careerreach.repository.*;
import com.careerreach.service.*;
import com.careerreach.util.ColumnHeaderNormalizer;
import com.careerreach.util.TemplateVariableUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class CareerReachApplicationTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private ContactService contactService;

    @Autowired
    private TemplateService templateService;

    private AuthResponse userA;
    private AuthResponse userB;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        RegisterRequest reqA = new RegisterRequest();
        reqA.setName("Alice Recruiter");
        reqA.setEmail("alice_" + suffix + "@company.com");
        reqA.setPassword("Secret123!");
        reqA.setConfirmPassword("Secret123!");
        userA = authService.register(reqA);

        RegisterRequest reqB = new RegisterRequest();
        reqB.setName("Bob Recruiter");
        reqB.setEmail("bob_" + suffix + "@company.com");
        reqB.setPassword("Secret123!");
        reqB.setConfirmPassword("Secret123!");
        userB = authService.register(reqB);
    }

    @Test
    @DisplayName("Context loads and User A can log in successfully")
    void testAuthLogin() {
        AuthRequest loginReq = new AuthRequest();
        loginReq.setEmail(userA.getUser().getEmail());
        loginReq.setPassword("Secret123!");

        AuthResponse loginRes = authService.login(loginReq);
        assertNotNull(loginRes.getToken());
        assertEquals(userA.getUser().getEmail(), loginRes.getUser().getEmail());
    }

    @Test
    @DisplayName("Duplicate user registration throws DuplicateResourceException")
    void testDuplicateRegistration() {
        RegisterRequest dupReq = new RegisterRequest();
        dupReq.setName("Duplicate User");
        dupReq.setEmail(userA.getUser().getEmail());
        dupReq.setPassword("Secret123!");
        dupReq.setConfirmPassword("Secret123!");

        assertThrows(DuplicateResourceException.class, () -> authService.register(dupReq));
    }

    @Test
    @DisplayName("Column header normalizer identifies variations")
    void testHeaderNormalizer() {
        assertEquals(ColumnHeaderNormalizer.CanonicalColumn.NAME, ColumnHeaderNormalizer.normalize("Full Name"));
        assertEquals(ColumnHeaderNormalizer.CanonicalColumn.NAME, ColumnHeaderNormalizer.normalize("Contact Name"));
        assertEquals(ColumnHeaderNormalizer.CanonicalColumn.EMAIL, ColumnHeaderNormalizer.normalize("Work Email"));
        assertEquals(ColumnHeaderNormalizer.CanonicalColumn.EMAIL, ColumnHeaderNormalizer.normalize("Email Address"));
        assertEquals(ColumnHeaderNormalizer.CanonicalColumn.COMPANY, ColumnHeaderNormalizer.normalize("Company Name"));
        assertEquals(ColumnHeaderNormalizer.CanonicalColumn.POSITION, ColumnHeaderNormalizer.normalize("Job Title"));
    }

    @Test
    @DisplayName("CSV Contact Import normalizes columns, imports valid rows, and flags duplicates & invalid rows")
    void testCsvContactImport() {
        String csvContent = """
                Full Name,Work Email,Company Name,Job Title
                Sarah Connor,sarah@skynet.com,Cyberdyne Systems,Head of Security
                John Connor,john@resistance.org,Resistance,Leader
                ,missingemail@domain.com,Unknown Org,Developer
                Invalid User,not-an-email,Bad Org,Tester
                Sarah Connor,sarah@skynet.com,Cyberdyne Systems,Head of Security
                """;

        MockMultipartFile csvFile = new MockMultipartFile(
                "file",
                "contacts.csv",
                "text/csv",
                csvContent.getBytes(StandardCharsets.UTF_8)
        );

        ImportSummaryDto summary = contactService.importContacts(userA.getUser().getId(), csvFile);

        assertEquals(5, summary.getTotalRows());
        assertEquals(3, summary.getValidCount()); // Sarah, John, and missing name with valid email
        assertEquals(2, summary.getInvalidCount()); // not-an-email and duplicate sarah
        assertEquals(1, summary.getDuplicateCount());

        PageResponse<ContactResponse> contacts = contactService.getContacts(
                userA.getUser().getId(), null, null, PageRequest.of(0, 10));
        assertEquals(3, contacts.getContent().size());
    }

    @Test
    @DisplayName("User Data Isolation: User B cannot access or modify User A's contacts or templates")
    void testDataIsolation() {
        ContactRequest contactReq = new ContactRequest();
        contactReq.setName("Target Candidate");
        contactReq.setEmail("candidate@target.com");
        contactReq.setCompany("Acme Corp");
        contactReq.setPosition("Staff Engineer");
        ContactResponse contactA = contactService.createContact(userA.getUser().getId(), contactReq);

        TemplateRequest templateReq = new TemplateRequest();
        templateReq.setName("Outreach Template");
        templateReq.setSubject("Opportunity at {{company}} for {{name}}");
        templateReq.setBody("Hello {{name}},\nWe are looking for a {{position}} at {{company}}.");
        TemplateResponse templateA = templateService.createTemplate(userA.getUser().getId(), templateReq);

        // User B cannot access User A's contact
        assertThrows(ResourceNotFoundException.class, () ->
                contactService.getContactById(userB.getUser().getId(), contactA.getId()));

        // User B cannot delete User A's contact
        assertThrows(ResourceNotFoundException.class, () ->
                contactService.deleteContact(userB.getUser().getId(), contactA.getId()));

        // User B cannot access User A's template
        assertThrows(ResourceNotFoundException.class, () ->
                templateService.getTemplateById(userB.getUser().getId(), templateA.getId()));

        // User B's template list is empty
        List<TemplateResponse> userBTemplates = templateService.getTemplates(userB.getUser().getId());
        assertTrue(userBTemplates.isEmpty());
    }

    @Test
    @DisplayName("Template Variable Preview correctly interpolates contact data")
    void testTemplatePreview() {
        ContactRequest contactReq = new ContactRequest();
        contactReq.setName("Maya Lin");
        contactReq.setEmail("maya@designworks.com");
        contactReq.setCompany("DesignWorks");
        contactReq.setPosition("Lead Architect");
        ContactResponse contact = contactService.createContact(userA.getUser().getId(), contactReq);

        TemplateRequest templateReq = new TemplateRequest();
        templateReq.setName("Architect Outreach");
        templateReq.setSubject("Exciting role for {{name}} at {{company}}");
        templateReq.setBody("Dear {{name}},\nI noticed your work as {{position}} at {{company}}.\nReach out at {{email}}.");
        TemplateResponse template = templateService.createTemplate(userA.getUser().getId(), templateReq);

        TemplatePreviewRequest previewReq = new TemplatePreviewRequest();
        previewReq.setContactId(contact.getId());

        TemplatePreviewResponse preview = templateService.previewTemplate(
                userA.getUser().getId(), template.getId(), previewReq);

        assertEquals("Exciting role for Maya Lin at DesignWorks", preview.getSubject());
        assertTrue(preview.getBody().contains("Dear Maya Lin,"));
        assertTrue(preview.getBody().contains("Lead Architect at DesignWorks"));
        assertTrue(preview.getBody().contains("maya@designworks.com"));
        assertTrue(preview.isPreviewMode());
    }

    @Autowired
    private EncryptionService encryptionService;

    @Autowired
    private GmailOAuthService gmailOAuthService;

    @Autowired
    private CampaignService campaignService;

    @Autowired
    private GmailConnectionRepository gmailConnectionRepository;

    @Test
    @DisplayName("EncryptionService successfully encrypts and decrypts OAuth tokens at rest with AES-256-GCM")
    void testEncryptionService() {
        String originalToken = "ya29.a0AfH6SMB_SAMPLE_GOOGLE_ACCESS_TOKEN_1234567890";
        String encrypted = encryptionService.encrypt(originalToken);

        assertNotNull(encrypted);
        assertNotEquals(originalToken, encrypted);
        assertFalse(encrypted.contains("ya29"));

        String decrypted = encryptionService.decrypt(encrypted);
        assertEquals(originalToken, decrypted);
    }

    @Test
    @DisplayName("Gmail Connection persists encrypted tokens and protects user isolation")
    void testGmailConnectionIsolation() {
        GmailConnection connA = GmailConnection.builder()
                .user(userRepository.findById(userA.getUser().getId()).orElseThrow())
                .googleAccountEmail("alice.recruiter@gmail.com")
                .encryptedAccessToken(encryptionService.encrypt("access_token_A"))
                .encryptedRefreshToken(encryptionService.encrypt("refresh_token_A"))
                .tokenExpiry(java.time.Instant.now().plusSeconds(3600))
                .build();
        gmailConnectionRepository.save(connA);

        GmailConnectionDto statusA = gmailOAuthService.getConnectionStatus(userA.getUser().getId());
        assertTrue(statusA.isConnected());
        assertEquals("alice.recruiter@gmail.com", statusA.getGoogleAccountEmail());

        // User B has no connection
        GmailConnectionDto statusB = gmailOAuthService.getConnectionStatus(userB.getUser().getId());
        assertFalse(statusB.isConnected());
    }

    @Test
    @DisplayName("Campaign creation, recipient population, and lifecycle controls")
    void testCampaignLifecycle() {
        // 1. Create a contact and template for User A
        ContactRequest contactReq = new ContactRequest();
        contactReq.setName("Marcus Vance");
        contactReq.setEmail("marcus@vance.com");
        contactReq.setCompany("Vance Global");
        contactReq.setPosition("Director of Engineering");
        ContactResponse contact = contactService.createContact(userA.getUser().getId(), contactReq);

        TemplateRequest templateReq = new TemplateRequest();
        templateReq.setName("Director Outreach");
        templateReq.setSubject("Role at {{company}} for {{name}}");
        templateReq.setBody("Hello {{name}}, exploring opportunities for {{position}}.");
        TemplateResponse template = templateService.createTemplate(userA.getUser().getId(), templateReq);

        // 2. Create campaign
        CreateCampaignRequest campReq = new CreateCampaignRequest();
        campReq.setName("Director Hiring Campaign Q3");
        campReq.setTemplateId(template.getId());
        campReq.setContactIds(List.of(contact.getId()));

        CampaignResponse campaign = campaignService.createCampaign(userA.getUser().getId(), campReq);
        assertNotNull(campaign.getId());
        assertEquals(CampaignStatus.DRAFT, campaign.getStatus());
        assertEquals(1, campaign.getTotalRecipients());

        // 3. Verify detail endpoint
        CampaignDetailResponse detail = campaignService.getCampaignById(userA.getUser().getId(), campaign.getId());
        assertEquals(1, detail.getRecipients().size());
        assertEquals("marcus@vance.com", detail.getRecipients().get(0).getContactEmail());
        assertEquals(CampaignRecipientStatus.PENDING, detail.getRecipients().get(0).getStatus());

        // 4. Data isolation: User B cannot access User A's campaign
        assertThrows(ResourceNotFoundException.class, () ->
                campaignService.getCampaignById(userB.getUser().getId(), campaign.getId()));

        // 5. Lifecycle test: Cancel campaign
        CampaignResponse cancelled = campaignService.cancelCampaign(userA.getUser().getId(), campaign.getId());
        assertEquals(CampaignStatus.FAILED, cancelled.getStatus());
    }

    @Autowired
    private com.careerreach.repository.UserRepository userRepository;
}
