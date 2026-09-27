package com.careerreach.util;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

public class ColumnHeaderNormalizer {

    public enum CanonicalColumn {
        NAME,
        EMAIL,
        COMPANY,
        POSITION,
        UNKNOWN
    }

    private static final Map<String, CanonicalColumn> HEADER_MAP = new HashMap<>();

    // Patterns for serial numbers / indices to explicitly reject
    private static final Pattern SERIAL_NO_PATTERN = Pattern.compile(
            "^(#|sno|s\\.no|srno|sr\\.no|slno|sl\\.no|serial|serialno|serialnumber|no|num|number|row|index|id|col|column\\d*|\\d+)$"
    );

    static {
        // Name variations
        register("name", CanonicalColumn.NAME);
        register("fullname", CanonicalColumn.NAME);
        register("full_name", CanonicalColumn.NAME);
        register("contactname", CanonicalColumn.NAME);
        register("contact_name", CanonicalColumn.NAME);
        register("recruitername", CanonicalColumn.NAME);
        register("recruiter_name", CanonicalColumn.NAME);
        register("candidatename", CanonicalColumn.NAME);
        register("candidate_name", CanonicalColumn.NAME);
        register("personname", CanonicalColumn.NAME);
        register("person_name", CanonicalColumn.NAME);
        register("hrname", CanonicalColumn.NAME);
        register("hr_name", CanonicalColumn.NAME);
        register("leadname", CanonicalColumn.NAME);

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
        register("hremail", CanonicalColumn.EMAIL);
        register("hremailid", CanonicalColumn.EMAIL);
        register("hr_email_id", CanonicalColumn.EMAIL);
        register("hr_email", CanonicalColumn.EMAIL);
        register("recruiteremail", CanonicalColumn.EMAIL);
        register("recruiter_email", CanonicalColumn.EMAIL);
        register("recruiteremailid", CanonicalColumn.EMAIL);
        register("officialemail", CanonicalColumn.EMAIL);
        register("businessemail", CanonicalColumn.EMAIL);
        register("corporateemail", CanonicalColumn.EMAIL);
        register("primaryemail", CanonicalColumn.EMAIL);
        register("e-mail", CanonicalColumn.EMAIL);
        register("e_mail", CanonicalColumn.EMAIL);

        // Company variations
        register("company", CanonicalColumn.COMPANY);
        register("companyname", CanonicalColumn.COMPANY);
        register("company_name", CanonicalColumn.COMPANY);
        register("organization", CanonicalColumn.COMPANY);
        register("org", CanonicalColumn.COMPANY);
        register("firm", CanonicalColumn.COMPANY);
        register("employer", CanonicalColumn.COMPANY);
        register("client", CanonicalColumn.COMPANY);

        // Position variations
        register("position", CanonicalColumn.POSITION);
        register("jobtitle", CanonicalColumn.POSITION);
        register("job_title", CanonicalColumn.POSITION);
        register("title", CanonicalColumn.POSITION);
        register("role", CanonicalColumn.POSITION);
        register("jobrole", CanonicalColumn.POSITION);
        register("designation", CanonicalColumn.POSITION);

        // Explicit serial number variations -> UNKNOWN
        register("sno", CanonicalColumn.UNKNOWN);
        register("srno", CanonicalColumn.UNKNOWN);
        register("slno", CanonicalColumn.UNKNOWN);
        register("serialno", CanonicalColumn.UNKNOWN);
        register("index", CanonicalColumn.UNKNOWN);
        register("row", CanonicalColumn.UNKNOWN);
        register("id", CanonicalColumn.UNKNOWN);
        register("no", CanonicalColumn.UNKNOWN);
        register("#", CanonicalColumn.UNKNOWN);
    }

    private static void register(String key, CanonicalColumn col) {
        HEADER_MAP.put(key.toLowerCase().replaceAll("[\\s-_]+", ""), col);
    }

    public static CanonicalColumn normalize(String header) {
        if (header == null || header.isBlank()) {
            return CanonicalColumn.UNKNOWN;
        }

        String clean = header.trim().toLowerCase().replaceAll("[\\s-_]+", "");
        if (clean.isEmpty() || SERIAL_NO_PATTERN.matcher(clean).matches()) {
            return CanonicalColumn.UNKNOWN;
        }

        if (HEADER_MAP.containsKey(clean)) {
            return HEADER_MAP.get(clean);
        }

        // Fuzzy heuristic classification
        if (clean.contains("email") || clean.contains("mailid") || clean.equals("mail") || clean.contains("emailid")) {
            return CanonicalColumn.EMAIL;
        }

        if (clean.contains("company") || clean.contains("organization") || clean.contains("firm") || clean.contains("employer")) {
            return CanonicalColumn.COMPANY;
        }

        if (clean.contains("position") || clean.contains("jobtitle") || clean.contains("designation") || clean.contains("jobrole")) {
            return CanonicalColumn.POSITION;
        }

        if ((clean.contains("fullname") || clean.contains("contactname") || clean.contains("recruitername")
                || clean.contains("hrname") || clean.contains("candidatename") || clean.equals("name")
                || clean.equals("person") || clean.equals("contact"))
                && !clean.contains("company") && !clean.contains("email") && !clean.contains("mail")) {
            return CanonicalColumn.NAME;
        }

        return CanonicalColumn.UNKNOWN;
    }
}
