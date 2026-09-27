package com.careerreach.service;

import com.careerreach.dto.ImportPreviewResponse;
import com.careerreach.repository.ContactRepository;
import com.careerreach.util.ColumnHeaderNormalizer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

class ExcelParserServiceUnitTest {

    @Test
    @DisplayName("Column header normalizer identifies variations and rejects serial numbers")
    void testNormalizer() {
        assertEquals(ColumnHeaderNormalizer.CanonicalColumn.EMAIL, ColumnHeaderNormalizer.normalize("HR EMAIL ID"));
        assertEquals(ColumnHeaderNormalizer.CanonicalColumn.EMAIL, ColumnHeaderNormalizer.normalize("hr_email"));
        assertEquals(ColumnHeaderNormalizer.CanonicalColumn.EMAIL, ColumnHeaderNormalizer.normalize("Work Email"));
        assertEquals(ColumnHeaderNormalizer.CanonicalColumn.COMPANY, ColumnHeaderNormalizer.normalize("COMPANY NAME"));
        assertEquals(ColumnHeaderNormalizer.CanonicalColumn.POSITION, ColumnHeaderNormalizer.normalize("Job Title"));
        assertEquals(ColumnHeaderNormalizer.CanonicalColumn.NAME, ColumnHeaderNormalizer.normalize("Full Name"));
        assertEquals(ColumnHeaderNormalizer.CanonicalColumn.NAME, ColumnHeaderNormalizer.normalize("Candidate Name"));

        // Reject serial number headers
        assertEquals(ColumnHeaderNormalizer.CanonicalColumn.UNKNOWN, ColumnHeaderNormalizer.normalize(""));
        assertEquals(ColumnHeaderNormalizer.CanonicalColumn.UNKNOWN, ColumnHeaderNormalizer.normalize("1"));
        assertEquals(ColumnHeaderNormalizer.CanonicalColumn.UNKNOWN, ColumnHeaderNormalizer.normalize("2"));
        assertEquals(ColumnHeaderNormalizer.CanonicalColumn.UNKNOWN, ColumnHeaderNormalizer.normalize("#"));
        assertEquals(ColumnHeaderNormalizer.CanonicalColumn.UNKNOWN, ColumnHeaderNormalizer.normalize("S.No"));
        assertEquals(ColumnHeaderNormalizer.CanonicalColumn.UNKNOWN, ColumnHeaderNormalizer.normalize("Sr. No"));
        assertEquals(ColumnHeaderNormalizer.CanonicalColumn.UNKNOWN, ColumnHeaderNormalizer.normalize("Sl. No"));
        assertEquals(ColumnHeaderNormalizer.CanonicalColumn.UNKNOWN, ColumnHeaderNormalizer.normalize("Index"));
    }

    @Test
    @DisplayName("Derives clean recruiter names from email handles")
    void testDeriveNameFromEmail() {
        assertEquals("Thameesthin J", ExcelParserService.deriveNameFromEmail("thameesthin.J@cognizant.com"));
        assertEquals("Shalini Gupta", ExcelParserService.deriveNameFromEmail("shalini.gupta@black-turtle.co"));
        assertEquals("Swati Sharma", ExcelParserService.deriveNameFromEmail("swati.sharma11@ibm.com"));
        assertEquals("Kavitha Balu", ExcelParserService.deriveNameFromEmail("Kavitha_Balu@epam.com"));
        assertEquals("Simran Priya", ExcelParserService.deriveNameFromEmail("simran.priya@impactanalytics.co"));
        assertEquals("Isha Qureshi", ExcelParserService.deriveNameFromEmail("isha.qureshi@accenture.com"));
        assertEquals("Hiring Team", ExcelParserService.deriveNameFromEmail("hr@cognizant.com"));
        assertEquals("Hiring Team", ExcelParserService.deriveNameFromEmail("careers@ibm.com"));
    }

    @Test
    @DisplayName("Preview suggested mapping ignores serial number columns and suggests email/company")
    void testPreviewSuggestedMapping() {
        ContactRepository contactRepo = Mockito.mock(ContactRepository.class);
        ExcelParserService parserService = new ExcelParserService(contactRepo);

        String csvContent = """
                #,COMPANY NAME,HR EMAIL ID
                1,Cognizant,thameesthin.J@cognizant.com
                2,Black Turtle,shalini.gupta@black-turtle.co
                3,IBM,swati.sharma11@ibm.com
                """;

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.csv",
                "text/csv",
                csvContent.getBytes(StandardCharsets.UTF_8)
        );

        ImportPreviewResponse preview = parserService.previewFile(file);

        assertNotNull(preview.getSuggestedMapping());
        assertEquals("COMPANY NAME", preview.getSuggestedMapping().get("company"));
        assertEquals("HR EMAIL ID", preview.getSuggestedMapping().get("email"));
        assertNull(preview.getSuggestedMapping().get("name")); // Serial number # is NOT suggested as name
    }

    @Test
    @DisplayName("Parse contact file with serial numbers and blank name mapping derives names from email")
    void testParseWithBlankNameMappingAndSerialColumn() {
        ContactRepository contactRepo = Mockito.mock(ContactRepository.class);
        ExcelParserService parserService = new ExcelParserService(contactRepo);

        String csvContent = """
                #,COMPANY NAME,HR EMAIL ID
                1,Cognizant,thameesthin.J@cognizant.com
                2,Black Turtle,shalini.gupta@black-turtle.co
                3,IBM,swati.sharma11@ibm.com
                """;

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.csv",
                "text/csv",
                csvContent.getBytes(StandardCharsets.UTF_8)
        );

        com.careerreach.entity.User user = com.careerreach.entity.User.builder()
                .id(java.util.UUID.randomUUID())
                .name("Test User")
                .email("test@careerreach.com")
                .passwordHash("hash")
                .build();

        // Custom mapping where name is empty (skipped)
        java.util.Map<String, String> customMapping = java.util.Map.of(
                "name", "",
                "email", "HR EMAIL ID",
                "company", "COMPANY NAME"
        );

        ExcelParserService.ParseResult result = parserService.parseFile(user, file, customMapping);

        assertEquals(3, result.validContacts().size());
        for (com.careerreach.entity.Contact c : result.validContacts()) {
            assertNotEquals("1", c.getName());
            assertNotEquals("2", c.getName());
            assertNotEquals("3", c.getName());
        }

        assertEquals("Thameesthin J", result.validContacts().get(0).getName());
        assertEquals("Cognizant", result.validContacts().get(0).getCompany());
        assertEquals("thameesthin.j@cognizant.com", result.validContacts().get(0).getEmail());

        assertEquals("Shalini Gupta", result.validContacts().get(1).getName());
        assertEquals("Black Turtle", result.validContacts().get(1).getCompany());

        assertEquals("Swati Sharma", result.validContacts().get(2).getName());
        assertEquals("IBM", result.validContacts().get(2).getCompany());
    }
}
