package com.careerreach.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
public class HealthController {

    private final DataSource dataSource;

    @GetMapping({"/api/health", "/health", "/actuator/health"})
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("application", "CareerReach Backend");
        response.put("version", "1.0.0");
        response.put("timestamp", Instant.now().toString());

        Map<String, Object> components = new LinkedHashMap<>();
        boolean dbHealthy = false;

        try (Connection conn = dataSource.getConnection()) {
            dbHealthy = conn.isValid(2);
            components.put("database", Map.of(
                    "status", dbHealthy ? "UP" : "DOWN",
                    "databaseProductName", conn.getMetaData().getDatabaseProductName()
            ));
        } catch (Exception e) {
            log.warn("Database health check probe failed: {}", e.getMessage());
            components.put("database", Map.of(
                    "status", "DOWN",
                    "error", e.getMessage()
            ));
        }

        response.put("components", components);

        if (!dbHealthy) {
            response.put("status", "DEGRADED");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }

        return ResponseEntity.ok(response);
    }
}
