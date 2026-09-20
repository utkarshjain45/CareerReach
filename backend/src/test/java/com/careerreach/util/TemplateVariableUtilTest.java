package com.careerreach.util;

import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class TemplateVariableUtilTest {

    @Test
    void testStandardInterpolation() {
        String template = "Hello {{name}} at {{company}}, applying for {{position}}!";
        String result = TemplateVariableUtil.interpolate(template, "Alice", "alice@example.com", "Google", "Staff Engineer");
        assertEquals("Hello Alice at Google, applying for Staff Engineer!", result);
    }

    @Test
    void testCustomSocialLinksInterpolation() {
        String template = "Hi {{name}},\nGitHub: {{github}}\nLeetCode: {{leetcode}}\nPortfolio: {{portfolio}}";
        Map<String, String> socialLinks = Map.of(
                "github", "https://github.com/alice",
                "leetcode", "https://leetcode.com/alice",
                "portfolio", "https://alice.dev"
        );

        String result = TemplateVariableUtil.interpolate(template, "Alice", "alice@test.com", "Acme", "Dev", socialLinks);
        assertTrue(result.contains("GitHub: https://github.com/alice"));
        assertTrue(result.contains("LeetCode: https://leetcode.com/alice"));
        assertTrue(result.contains("Portfolio: https://alice.dev"));
    }

    @Test
    void testUnknownVariablesWithAllowedSet() {
        String template = "Hi {{name}}, check {{github}} and {{unknown_var}}";
        var unknowns = TemplateVariableUtil.findUnknownVariables(template, Set.of("github"));
        assertEquals(1, unknowns.size());
        assertEquals("{{unknown_var}}", unknowns.get(0));
    }

    @Test
    void testHyperlinkInterpolation() {
        String template = "Check my <a href=\"{{github}}\">GitHub</a> and [LeetCode]({{leetcode}})";
        Map<String, String> socialLinks = Map.of(
                "github", "https://github.com/alice",
                "leetcode", "https://leetcode.com/u/alice"
        );

        String result = TemplateVariableUtil.interpolate(template, "Alice", "alice@test.com", "Acme", "Dev", socialLinks);
        assertEquals("Check my <a href=\"https://github.com/alice\">GitHub</a> and [LeetCode](https://leetcode.com/u/alice)", result);

        var unknowns = TemplateVariableUtil.findUnknownVariables(template, Set.of("github", "leetcode"));
        assertTrue(unknowns.isEmpty(), "Should recognize variables inside HTML tags and markdown links");
    }
}
