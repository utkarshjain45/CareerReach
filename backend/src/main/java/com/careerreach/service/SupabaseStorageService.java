package com.careerreach.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Slf4j
@Service
public class SupabaseStorageService implements StorageService {

    private final RestClient restClient;
    private final String supabaseUrl;
    private final String serviceKey;
    private final String bucket;

    public SupabaseStorageService(
            @Value("${supabase.url:}") String supabaseUrl,
            @Value("${supabase.service-key:}") String serviceKey,
            @Value("${supabase.bucket:careerreach-resumes}") String bucket
    ) {
        String cleanedUrl = supabaseUrl != null ? supabaseUrl.trim().replaceAll("/+$", "") : "";
        if (cleanedUrl.endsWith("/rest/v1")) {
            cleanedUrl = cleanedUrl.substring(0, cleanedUrl.length() - "/rest/v1".length()).replaceAll("/+$", "");
        } else if (cleanedUrl.endsWith("/rest")) {
            cleanedUrl = cleanedUrl.substring(0, cleanedUrl.length() - "/rest".length()).replaceAll("/+$", "");
        }
        this.supabaseUrl = cleanedUrl;
        this.serviceKey = serviceKey != null ? serviceKey.trim() : "";
        this.bucket = bucket != null ? bucket.trim() : "careerreach-resumes";
        this.restClient = RestClient.builder().build();

        if (this.supabaseUrl.isBlank() || this.serviceKey.isBlank()) {
            log.warn("Supabase Storage credentials are not fully configured (supabase.url or supabase.service-key is empty). Storage operations will require these to be set.");
        }
    }

    private void ensureConfigured() {
        if (supabaseUrl.isBlank() || serviceKey.isBlank()) {
            throw new IllegalStateException("Supabase Storage is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment.");
        }
    }

    @Override
    public void upload(String path, byte[] data, String contentType) {
        ensureConfigured();
        String cleanPath = path.replaceAll("^/+", "");
        String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + cleanPath;

        try {
            log.info("Uploading object to Supabase Storage: bucket='{}', path='{}', size={} bytes", bucket, cleanPath, data.length);

            restClient.post()
                    .uri(uploadUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceKey)
                    .header("apikey", serviceKey)
                    .header("x-upsert", "true")
                    .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/pdf"))
                    .body(data)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> {
                        String errorBody = new String(resp.getBody().readAllBytes());
                        log.error("Supabase upload failed with status {}: {}", resp.getStatusCode(), errorBody);
                        throw new RuntimeException("Remote storage service rejected upload (status " + resp.getStatusCode().value() + ")");
                    })
                    .toBodilessEntity();

            log.info("Successfully uploaded object to Supabase Storage at path '{}'", cleanPath);
        } catch (Exception e) {
            log.error("Error during Supabase storage upload for path '{}': {}", cleanPath, e.getMessage(), e);
            throw new RuntimeException("Failed to upload file to cloud storage. Please try again.", e);
        }
    }

    @Override
    public byte[] download(String path) {
        ensureConfigured();
        String cleanPath = path.replaceAll("^/+", "");
        // First attempt authenticated object endpoint
        String downloadUrl = supabaseUrl + "/storage/v1/object/authenticated/" + bucket + "/" + cleanPath;

        try {
            log.debug("Downloading object from Supabase Storage: bucket='{}', path='{}'", bucket, cleanPath);

            return restClient.get()
                    .uri(downloadUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceKey)
                    .header("apikey", serviceKey)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> {
                        // Fallback attempt to standard object path with bearer token
                        String fallbackUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + cleanPath;
                        try {
                            byte[] fallbackBytes = restClient.get()
                                    .uri(fallbackUrl)
                                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceKey)
                                    .header("apikey", serviceKey)
                                    .retrieve()
                                    .body(byte[].class);
                            if (fallbackBytes != null) {
                                return;
                            }
                        } catch (Exception ignored) {}

                        String errorBody = new String(resp.getBody().readAllBytes());
                        log.error("Supabase download failed with status {}: {}", resp.getStatusCode(), errorBody);
                        throw new RuntimeException("Failed to download object from remote storage");
                    })
                    .body(byte[].class);
        } catch (Exception e) {
            log.error("Error downloading file from Supabase Storage at path '{}': {}", cleanPath, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve file from storage", e);
        }
    }

    @Override
    public void delete(String path) {
        if (supabaseUrl.isBlank() || serviceKey.isBlank()) {
            log.warn("Supabase credentials not configured, skipping remote delete for path '{}'", path);
            return;
        }

        String cleanPath = path.replaceAll("^/+", "");
        String deleteUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + cleanPath;

        try {
            log.info("Deleting object from Supabase Storage: bucket='{}', path='{}'", bucket, cleanPath);

            restClient.delete()
                    .uri(deleteUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceKey)
                    .header("apikey", serviceKey)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> {
                        // 404 is acceptable if file was already deleted
                        if (resp.getStatusCode().value() == 404) {
                            log.warn("Object '{}' not found in Supabase Storage during delete", cleanPath);
                            return;
                        }
                        String errorBody = new String(resp.getBody().readAllBytes());
                        log.error("Supabase delete failed with status {}: {}", resp.getStatusCode(), errorBody);
                        throw new RuntimeException("Supabase delete failed: " + errorBody);
                    })
                    .toBodilessEntity();

            log.info("Successfully deleted object from Supabase Storage: '{}'", cleanPath);
        } catch (Exception e) {
            log.error("Error deleting object from Supabase Storage at path '{}': {}", cleanPath, e.getMessage());
            // Do not re-throw if it's a non-critical cleanup failure, but log thoroughly
        }
    }

    @Override
    public boolean exists(String path) {
        if (supabaseUrl.isBlank() || serviceKey.isBlank()) {
            return false;
        }

        String cleanPath = path.replaceAll("^/+", "");
        String infoUrl = supabaseUrl + "/storage/v1/object/info/authenticated/" + bucket + "/" + cleanPath;

        try {
            var response = restClient.get()
                    .uri(infoUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceKey)
                    .header("apikey", serviceKey)
                    .retrieve()
                    .toBodilessEntity();

            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            return false;
        }
    }
}
