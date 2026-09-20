package com.careerreach.util;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class TemplateVariableUtil {

    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\{\\{\\s*([a-zA-Z0-9_]+)\\s*\\}\\}");
    public static final Set<String> SUPPORTED_VARIABLES = Set.of("name", "email", "company", "position");

    public static String interpolate(String template, String name, String email, String company, String position) {
        return interpolate(template, name, email, company, position, Collections.emptyMap());
    }

    public static String interpolate(String template, String name, String email, String company, String position, Map<String, String> customVariables) {
        if (template == null) {
            return "";
        }

        Matcher matcher = VARIABLE_PATTERN.matcher(template);
        StringBuilder sb = new StringBuilder();

        while (matcher.find()) {
            String variable = matcher.group(1).toLowerCase();
            String replacement = switch (variable) {
                case "name" -> name != null && !name.isBlank() ? name : "";
                case "email" -> email != null && !email.isBlank() ? email : "";
                case "company" -> company != null && !company.isBlank() ? company : "";
                case "position" -> position != null && !position.isBlank() ? position : "";
                default -> {
                    if (customVariables != null && customVariables.containsKey(variable)) {
                        String customVal = customVariables.get(variable);
                        yield customVal != null ? customVal : "";
                    }
                    yield matcher.group(0); // keep original if unknown
                }
            };
            matcher.appendReplacement(sb, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(sb);

        return sb.toString();
    }

    public static List<String> findUnknownVariables(String text) {
        return findUnknownVariables(text, Collections.emptySet());
    }

    public static List<String> findUnknownVariables(String text, Set<String> allowedCustomVars) {
        if (text == null || text.isBlank()) return Collections.emptyList();
        Matcher matcher = VARIABLE_PATTERN.matcher(text);
        List<String> unknowns = new ArrayList<>();
        while (matcher.find()) {
            String var = matcher.group(1).toLowerCase();
            if (!SUPPORTED_VARIABLES.contains(var) && (allowedCustomVars == null || !allowedCustomVars.contains(var))) {
                unknowns.add(matcher.group(0));
            }
        }
        return unknowns;
    }

    public static Set<String> extractAllVariables(String text) {
        if (text == null || text.isBlank()) return Collections.emptySet();
        Matcher matcher = VARIABLE_PATTERN.matcher(text);
        Set<String> vars = new HashSet<>();
        while (matcher.find()) {
            vars.add(matcher.group(1).toLowerCase());
        }
        return vars;
    }
}
