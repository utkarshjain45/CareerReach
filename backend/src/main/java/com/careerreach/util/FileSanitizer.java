package com.careerreach.util;

import java.nio.file.Paths;

public final class FileSanitizer {

    private FileSanitizer() {}

    /**
     * Sanitizes a user-provided filename to prevent path traversal, null byte injections,
     * or invalid character sequences.
     */
    public static String sanitizeFilename(String filename) {
        if (filename == null || filename.isBlank()) {
            return "attachment.pdf";
        }

        // 1. Remove null bytes and control characters first
        String cleanName = filename.replaceAll("[\\x00-\\x1F\\x7F]", "");

        // 2. Extract filename from path separators (handling both '/' and '\')
        int lastSlash = Math.max(cleanName.lastIndexOf('/'), cleanName.lastIndexOf('\\'));
        if (lastSlash >= 0 && lastSlash < cleanName.length() - 1) {
            cleanName = cleanName.substring(lastSlash + 1);
        }

        // 3. Remove path traversal sequences just in case
        cleanName = cleanName.replaceAll("\\.\\.+[/\\\\]?", "");

        // 4. Trim spaces
        cleanName = cleanName.trim();

        if (cleanName.isBlank()) {
            cleanName = "attachment.pdf";
        }

        // 5. Ensure it has a safe length
        if (cleanName.length() > 180) {
            String ext = cleanName.toLowerCase().endsWith(".pdf") ? ".pdf" : "";
            cleanName = cleanName.substring(0, 180 - ext.length()) + ext;
        }

        return cleanName;
    }
}
