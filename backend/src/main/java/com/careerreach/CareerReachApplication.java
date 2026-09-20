package com.careerreach;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.nio.file.Files;
import java.util.List;

@SpringBootApplication
public class CareerReachApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(CareerReachApplication.class, args);
    }

    private static void loadDotEnv() {
        String[] potentialPaths = {".env", "backend/.env", "../backend/.env", "../.env"};
        for (String p : potentialPaths) {
            File f = new File(p);
            if (f.exists() && f.isFile()) {
                try {
                    List<String> lines = Files.readAllLines(f.toPath());
                    for (String rawLine : lines) {
                        String line = rawLine.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx == -1) {
                            eqIdx = line.indexOf(':');
                        }
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String val = line.substring(eqIdx + 1).trim();
                            if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                                val = val.substring(1, val.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, val);
                            }
                        }
                    }
                    System.out.println("Successfully loaded environment variables from: " + f.getAbsolutePath());
                    break;
                } catch (Exception e) {
                    System.err.println("Notice: Could not parse environment file " + f.getAbsolutePath() + ": " + e.getMessage());
                }
            }
        }
    }
}
