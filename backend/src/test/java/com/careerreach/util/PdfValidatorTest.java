package com.careerreach.util;

import com.careerreach.exception.BadRequestException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

class PdfValidatorTest {

    private static final long MAX_5MB = 5 * 1024 * 1024;

    @Test
    @DisplayName("Should accept valid PDF file with %PDF- header and %%EOF trailer")
    void testValidPdf() {
        byte[] validPdfBytes = ("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\nstartxref\n123\n%%EOF")
                .getBytes(StandardCharsets.ISO_8859_1);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "Utkarsh_Resume.pdf",
                "application/pdf",
                validPdfBytes
        );

        assertDoesNotThrow(() -> PdfValidator.validate(file, MAX_5MB));
    }

    @Test
    @DisplayName("Should reject empty file")
    void testEmptyFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "resume.pdf",
                "application/pdf",
                new byte[0]
        );

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> PdfValidator.validate(file, MAX_5MB));
        assertTrue(ex.getMessage().contains("Please select a PDF file"));
    }

    @Test
    @DisplayName("Should reject file larger than 5 MB")
    void testOversizedFile() {
        byte[] largeBytes = new byte[6 * 1024 * 1024];
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "large_resume.pdf",
                "application/pdf",
                largeBytes
        );

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> PdfValidator.validate(file, MAX_5MB));
        assertTrue(ex.getMessage().contains("exceeds the maximum limit"));
    }

    @Test
    @DisplayName("Should reject non-PDF extension")
    void testNonPdfExtension() {
        byte[] dummyBytes = "%PDF-1.4\n%%EOF".getBytes(StandardCharsets.ISO_8859_1);
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "resume.docx",
                "application/pdf",
                dummyBytes
        );

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> PdfValidator.validate(file, MAX_5MB));
        assertTrue(ex.getMessage().contains("Only PDF files (.pdf) are allowed"));
    }

    @Test
    @DisplayName("Should reject disguised file without %PDF- magic bytes")
    void testFakePdfDisguisedExecutableOrText() {
        byte[] fakeBytes = ("Hello world, this is a plain text file pretending to be PDF!\n%%EOF")
                .getBytes(StandardCharsets.ISO_8859_1);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "malicious.pdf",
                "application/pdf",
                fakeBytes
        );

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> PdfValidator.validate(file, MAX_5MB));
        assertTrue(ex.getMessage().contains("file signature does not match a valid PDF"));
    }

    @Test
    @DisplayName("Should reject PDF missing %%EOF trailer")
    void testMissingEofTrailer() {
        byte[] truncatedPdf = ("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n").getBytes(StandardCharsets.ISO_8859_1);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "truncated.pdf",
                "application/pdf",
                truncatedPdf
        );

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> PdfValidator.validate(file, MAX_5MB));
        assertTrue(ex.getMessage().contains("missing EOF marker"));
    }

    @Test
    @DisplayName("FileSanitizer should strip path traversal and control characters")
    void testFileSanitizer() {
        assertEquals("resume.pdf", FileSanitizer.sanitizeFilename("../../resume.pdf"));
        assertEquals("resume.pdf", FileSanitizer.sanitizeFilename("..\\..\\resume.pdf"));
        assertEquals("my_resume.pdf", FileSanitizer.sanitizeFilename("C:\\Users\\test\\my_resume.pdf"));
        assertEquals("resume.pdf", FileSanitizer.sanitizeFilename("resume\0.pdf"));
        assertEquals("attachment.pdf", FileSanitizer.sanitizeFilename("   "));
        assertEquals("attachment.pdf", FileSanitizer.sanitizeFilename(null));
    }
}
