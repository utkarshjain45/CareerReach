package com.careerreach.util;

import java.util.HashMap;
import java.util.Map;

public class ColumnHeaderNormalizer {

    public enum CanonicalColumn {
        NAME,
        EMAIL,
        COMPANY,
        POSITION,
        UNKNOWN
    }

    private static final Map<String, CanonicalColumn> HEADER_MAP = new HashMap<>();

    static {
        // Name variations
        register("name", CanonicalColumn.NAME);
        register("fullname", CanonicalColumn.NAME);
        register("full_name", CanonicalColumn.NAME);
        register("contactname", CanonicalColumn.NAME);
        register("contact_name", CanonicalColumn.NAME);
        register("recruitername", CanonicalColumn.NAME);
        register("hrname", CanonicalColumn.NAME);

        // Email variations
        register("email", CanonicalColumn.EMAIL);
        register("emailaddress", CanonicalColumn.EMAIL);
        register("email_address", CanonicalColumn.EMAIL);
        register("workemail", CanonicalColumn.EMAIL);
        register("work_email", CanonicalColumn.EMAIL);
        register("contactemail", CanonicalColumn.EMAIL);
        register("mail", CanonicalColumn.EMAIL);
        register("mailid", CanonicalColumn.EMAIL);
        register("mail_id", CanonicalColumn.EMAIL);
        register("emailid", CanonicalColumn.EMAIL);
        register("email_id", CanonicalColumn.EMAIL);

        // Company variations
        register("company", CanonicalColumn.COMPANY);
        register("companyname", CanonicalColumn.COMPANY);
        register("company_name", CanonicalColumn.COMPANY);
        register("organization", CanonicalColumn.COMPANY);
        register("org", CanonicalColumn.COMPANY);
        register("firm", CanonicalColumn.COMPANY);

        // Position variations
        register("position", CanonicalColumn.POSITION);
        register("jobtitle", CanonicalColumn.POSITION);
        register("job_title", CanonicalColumn.POSITION);
        register("title", CanonicalColumn.POSITION);
        register("role", CanonicalColumn.POSITION);
        register("jobrole", CanonicalColumn.POSITION);
    }

    private static void register(String key, CanonicalColumn col) {
        HEADER_MAP.put(key.toLowerCase().replaceAll("[\\s-_]+", ""), col);
    }

    public static CanonicalColumn normalize(String header) {
        if (header == null) {
            return CanonicalColumn.UNKNOWN;
        }
        String clean = header.trim().toLowerCase().replaceAll("[\\s-_]+", "");
        return HEADER_MAP.getOrDefault(clean, CanonicalColumn.UNKNOWN);
    }
}
