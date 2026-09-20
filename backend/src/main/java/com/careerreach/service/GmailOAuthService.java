package com.careerreach.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.careerreach.dto.GmailConnectionDto;
import com.careerreach.entity.GmailConnection;
import com.careerreach.entity.User;
import com.careerreach.exception.BadRequestException;
import com.careerreach.exception.ResourceNotFoundException;
import com.careerreach.repository.GmailConnectionRepository;
import com.careerreach.repository.UserRepository;
import com.careerreach.service.EncryptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class GmailOAuthService {

    private final GmailConnectionRepository gmailConnectionRepository;
    private final UserRepository userRepository;
    private final EncryptionService encryptionService;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${google.client-id:}")
    private String clientId;

    @Value("${google.client-secret:}")
    private String clientSecret;

    @Value("${google.redirect-uri:http://localhost:5173/oauth/callback}")
    private String redirectUri;

    private static final String GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
    private static final String GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v2/userinfo";
    private static final String SCOPES = "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email";

    public GmailOAuthService(
            GmailConnectionRepository gmailConnectionRepository,
            UserRepository userRepository,
            EncryptionService encryptionService,
            ObjectMapper objectMapper) {
        this.gmailConnectionRepository = gmailConnectionRepository;
        this.userRepository = userRepository;
        this.encryptionService = encryptionService;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    public String generateAuthUrl(UUID userId) {
        if (clientId == null || clientId.isBlank()) {
            log.error("Google OAuth failed: GOOGLE_CLIENT_ID is not configured in backend/.env or environment.");
            throw new BadRequestException("Google Client ID is not configured. Please add GOOGLE_CLIENT_ID to your backend/.env file and restart the backend.");
        }

        String state = userId.toString() + ":" + UUID.randomUUID().toString().substring(0, 8);

        return UriComponentsBuilder.fromHttpUrl(GOOGLE_AUTH_ENDPOINT)
                .queryParam("client_id", clientId.trim())
                .queryParam("redirect_uri", redirectUri.trim())
                .queryParam("response_type", "code")
                .queryParam("scope", SCOPES)
                .queryParam("access_type", "offline")
                .queryParam("prompt", "consent")
                .queryParam("state", state)
                .build()
                .toUriString();
    }

    @Transactional
    public GmailConnectionDto handleOAuthCallback(UUID userId, String code) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (code == null || code.isBlank()) {
            throw new BadRequestException("Authorization code is missing");
        }

        try {
            // 1. Exchange code for tokens
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("code", code);
            params.add("client_id", clientId);
            params.add("client_secret", clientSecret);
            params.add("redirect_uri", redirectUri);
            params.add("grant_type", "authorization_code");

            String tokenResponse = restClient.post()
                    .uri(GOOGLE_TOKEN_ENDPOINT)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(params)
                    .retrieve()
                    .body(String.class);

            JsonNode tokenJson = objectMapper.readTree(tokenResponse);
            String accessToken = tokenJson.path("access_token").asText();
            String refreshToken = tokenJson.has("refresh_token") ? tokenJson.path("refresh_token").asText() : null;
            long expiresIn = tokenJson.path("expires_in").asLong(3600);

            if (accessToken == null || accessToken.isBlank()) {
                throw new BadRequestException("Failed to retrieve access token from Google");
            }

            // 2. Fetch Google user profile email
            String userinfoResponse = restClient.get()
                    .uri(GOOGLE_USERINFO_ENDPOINT)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .retrieve()
                    .body(String.class);

            JsonNode userinfoJson = objectMapper.readTree(userinfoResponse);
            String googleEmail = userinfoJson.path("email").asText();

            if (googleEmail == null || googleEmail.isBlank()) {
                throw new BadRequestException("Could not verify Google email address");
            }

            // 3. Encrypt and persist connection
            Optional<GmailConnection> existing = gmailConnectionRepository.findByUserId(userId);
            GmailConnection connection = existing.orElseGet(() -> GmailConnection.builder().user(user).build());

            connection.setGoogleAccountEmail(googleEmail);
            connection.setEncryptedAccessToken(encryptionService.encrypt(accessToken));
            if (refreshToken != null && !refreshToken.isBlank()) {
                connection.setEncryptedRefreshToken(encryptionService.encrypt(refreshToken));
            }
            connection.setTokenExpiry(Instant.now().plusSeconds(expiresIn));

            connection = gmailConnectionRepository.save(connection);

            return GmailConnectionDto.builder()
                    .connected(true)
                    .googleAccountEmail(connection.getGoogleAccountEmail())
                    .connectedAt(connection.getConnectedAt())
                    .tokenExpired(false)
                    .build();

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google OAuth token exchange failed: {}", e.getMessage(), e);
            throw new BadRequestException("Failed to complete Google authorization: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public GmailConnectionDto getConnectionStatus(UUID userId) {
        Optional<GmailConnection> opt = gmailConnectionRepository.findByUserId(userId);
        if (opt.isEmpty()) {
            return GmailConnectionDto.builder()
                    .connected(false)
                    .build();
        }

        GmailConnection conn = opt.get();
        boolean isExpired = conn.getTokenExpiry() != null && Instant.now().isAfter(conn.getTokenExpiry());

        return GmailConnectionDto.builder()
                .connected(true)
                .googleAccountEmail(conn.getGoogleAccountEmail())
                .connectedAt(conn.getConnectedAt())
                .tokenExpired(isExpired)
                .build();
    }

    @Transactional
    public void disconnect(UUID userId) {
        gmailConnectionRepository.deleteByUserId(userId);
    }

    @Transactional
    public String getValidAccessToken(UUID userId) {
        GmailConnection connection = gmailConnectionRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("No Gmail account connected. Please connect your Gmail first."));

        // If expires within 120 seconds, refresh it
        Instant now = Instant.now();
        if (connection.getTokenExpiry() == null || now.plusSeconds(120).isAfter(connection.getTokenExpiry())) {
            return refreshAccessToken(connection);
        }

        return encryptionService.decrypt(connection.getEncryptedAccessToken());
    }

    private String refreshAccessToken(GmailConnection connection) {
        if (connection.getEncryptedRefreshToken() == null) {
            throw new BadRequestException("Gmail refresh token is missing. Please reconnect your Gmail account.");
        }

        String refreshToken = encryptionService.decrypt(connection.getEncryptedRefreshToken());

        try {
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("client_id", clientId);
            params.add("client_secret", clientSecret);
            params.add("refresh_token", refreshToken);
            params.add("grant_type", "refresh_token");

            String tokenResponse = restClient.post()
                    .uri(GOOGLE_TOKEN_ENDPOINT)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(params)
                    .retrieve()
                    .body(String.class);

            JsonNode json = objectMapper.readTree(tokenResponse);
            String newAccessToken = json.path("access_token").asText();
            long expiresIn = json.path("expires_in").asLong(3600);

            connection.setEncryptedAccessToken(encryptionService.encrypt(newAccessToken));
            connection.setTokenExpiry(Instant.now().plusSeconds(expiresIn));
            gmailConnectionRepository.save(connection);

            return newAccessToken;
        } catch (Exception e) {
            log.error("Failed to refresh Gmail token for user: {}", connection.getUser().getId(), e);
            throw new BadRequestException("Gmail authorization expired or was revoked. Please reconnect your account.");
        }
    }
}
