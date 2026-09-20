package com.careerreach.util;

import com.careerreach.exception.BadRequestException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

public final class PdfValidator {

    public static final long DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final byte[] PDF_MAGIC_BYTES = new byte[]{0x25, 0x50, 0x44, 0x46, 0x2D}; // "%PDF-"
    private static final String PDF_EOF_MARKER = "%%EOF";

    private PdfValidator() {}

    /**
     * Validates that the uploaded file is a valid PDF file meeting all security and size criteria.
     * Throws BadRequestException if validation fails.
     */
    public static void validate(MultipartFile file, long maxFileSize) {
        // 1. File presence
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a PDF file to upload.");
        }

        // 2. File size check
        if (file.getSize() > maxFileSize) {
            long maxMb = maxFileSize / (1024 * 1024);
            throw new BadRequestException("File size exceeds the maximum limit of " + maxMb + " MB.");
        }

        // 3. Filename check
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new BadRequestException("Only PDF files (.pdf) are allowed.");
        }

        // 4. Declared content type check
        String contentType = file.getContentType();
        if (contentType != null && !contentType.isBlank() && !contentType.equalsIgnoreCase("application/pdf")) {
            throw new BadRequestException("Invalid content type. Expected application/pdf.");
        }

        // 5. Binary magic bytes and structural validation
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new BadRequestException("Unable to read uploaded file contents: " + e.getMessage());
        }

        if (bytes.length < 10) {
            throw new BadRequestException("The uploaded file is too small to be a valid PDF document.");
        }

        // Check for %PDF- in the first 1024 bytes (per PDF specification ISO 32000-1)
        int headerLimit = Math.min(bytes.length, 1024);
        boolean hasPdfHeader = false;
        for (int i = 0; i <= headerLimit - PDF_MAGIC_BYTES.length; i++) {
            if (bytes[i] == PDF_MAGIC_BYTES[0] &&
                bytes[i + 1] == PDF_MAGIC_BYTES[1] &&
                bytes[i + 2] == PDF_MAGIC_BYTES[2] &&
                bytes[i + 3] == PDF_MAGIC_BYTES[3] &&
                bytes[i + 4] == PDF_MAGIC_BYTES[4]) {
                hasPdfHeader = true;
                break;
            }
        }

        if (!hasPdfHeader) {
            throw new BadRequestException("Invalid file format. The file signature does not match a valid PDF document.");
        }

        // Check for EOF marker in the last 1024 bytes
        int tailStart = Math.max(0, bytes.length - 1024);
        String tail = new String(bytes, tailStart, bytes.length - tailStart, StandardCharsets.ISO_8859_1);
        if (!tail.contains(PDF_EOF_MARKER)) {
            throw new BadRequestException("Corrupted or incomplete PDF document (missing EOF marker).");
        }
    }
}
