package com.careerreach.service;

import com.careerreach.dto.EmailAttachmentPayload;
import com.careerreach.dto.GmailConnectionDto;
import com.careerreach.exception.BadRequestException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.activation.DataHandler;
import jakarta.mail.Message;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.internet.MimeUtility;
import jakarta.mail.util.ByteArrayDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.io.ByteArrayOutputStream;
import java.util.*;

@Slf4j
@Service
public class GmailSenderService {

    private final GmailOAuthService gmailOAuthService;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    private static final String GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

    public GmailSenderService(GmailOAuthService gmailOAuthService, ObjectMapper objectMapper) {
        this.gmailOAuthService = gmailOAuthService;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    public void sendEmail(UUID userId, String toEmail, String subject, String body) {
        sendEmail(userId, toEmail, subject, body, Collections.emptyList());
    }

    public void sendEmail(UUID userId, String toEmail, String subject, String body, List<EmailAttachmentPayload> attachments) {
        GmailConnectionDto connection = gmailOAuthService.getConnectionStatus(userId);
        if (!connection.isConnected()) {
            throw new BadRequestException("Gmail account is not connected. Please connect your Gmail account.");
        }

        String accessToken = gmailOAuthService.getValidAccessToken(userId);
        String fromEmail = connection.getGoogleAccountEmail();

        try {
            // 1. Construct RFC 822 MIME Message
            Properties props = new Properties();
            Session session = Session.getDefaultInstance(props, null);
            MimeMessage mimeMessage = new MimeMessage(session);

            mimeMessage.setFrom(new InternetAddress(fromEmail));
            mimeMessage.addRecipient(Message.RecipientType.TO, new InternetAddress(toEmail));
            mimeMessage.setSubject(subject, "UTF-8");

            String finalBody = body != null ? body : "";
            boolean isHtml = isHtmlContent(finalBody);
            String formattedBody = isHtml ? prepareHtmlBody(finalBody) : finalBody;

            if (attachments != null && !attachments.isEmpty()) {
                // MIME multipart/mixed container
                MimeMultipart multipart = new MimeMultipart("mixed");

                // 1a. Body Part
                MimeBodyPart bodyPart = new MimeBodyPart();
                if (isHtml) {
                    bodyPart.setContent(formattedBody, "text/html; charset=UTF-8");
                } else {
                    bodyPart.setText(finalBody, "UTF-8");
                }
                multipart.addBodyPart(bodyPart);

                // 1b. Attachment Parts
                for (EmailAttachmentPayload att : attachments) {
                    MimeBodyPart attachmentPart = new MimeBodyPart();
                    String mimeType = att.getContentType() != null && !att.getContentType().isBlank()
                            ? att.getContentType()
                            : "application/pdf";

                    ByteArrayDataSource dataSource = new ByteArrayDataSource(att.getData(), mimeType);
                    attachmentPart.setDataHandler(new DataHandler(dataSource));
                    attachmentPart.setFileName(MimeUtility.encodeText(att.getFileName()));
                    attachmentPart.setHeader("Content-Type", mimeType);
                    multipart.addBodyPart(attachmentPart);
                }

                mimeMessage.setContent(multipart);
            } else {
                // Plain or HTML message without attachments
                if (isHtml) {
                    mimeMessage.setContent(formattedBody, "text/html; charset=UTF-8");
                } else {
                    mimeMessage.setText(finalBody, "UTF-8");
                }
            }

            // 2. Base64URL encode MIME message
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            mimeMessage.writeTo(outputStream);
            byte[] rawBytes = outputStream.toByteArray();
            String encodedEmail = Base64.getUrlEncoder().withoutPadding().encodeToString(rawBytes);

            // 3. Send via Gmail API
            Map<String, String> requestPayload = Map.of("raw", encodedEmail);

            String response = restClient.post()
                    .uri(GMAIL_SEND_URL)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestPayload)
                    .retrieve()
                    .body(String.class);

            int attCount = attachments != null ? attachments.size() : 0;
            log.info("Successfully sent email via Gmail to {} for user {} with {} attachments. Response: {}",
                    toEmail, userId, attCount, response);

        } catch (Exception e) {
            log.error("Failed to send email via Gmail API to {}: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("Gmail send failed: " + e.getMessage(), e);
        }
    }

    private boolean isHtmlContent(String body) {
        if (body == null || body.isBlank()) return false;
        String lower = body.toLowerCase();
        return lower.contains("<p>") || lower.contains("<br") || lower.contains("<div>")
                || lower.contains("<a ") || lower.contains("</a>")
                || lower.contains("<b>") || lower.contains("<strong>")
                || lower.contains("<i>") || lower.contains("<em>")
                || lower.contains("<ul>") || lower.contains("<ol>") || lower.contains("<li>")
                || body.matches("(?s).*\\[[^\\]]+\\]\\(https?://[^\\s)]+\\).*");
    }

    private String prepareHtmlBody(String body) {
        if (body == null) return "";
        String processed = body;

        // Convert Markdown links [Text](https://url) to <a href="https://url">Text</a>
        processed = processed.replaceAll("\\[([^\\]]+)\\]\\((https?://[^\\s)]+)\\)", "<a href=\"$2\" style=\"color: #2563eb; text-decoration: underline;\">$1</a>");

        // Ensure any raw <a> tags have clean link styling if not styled
        processed = processed.replaceAll("<a\\s+(?!.*?style=)(href=[\"'][^\"']+[\"'])>", "<a $1 style=\"color: #2563eb; text-decoration: underline;\">");

        // If the template content does not already wrap lines in HTML block tags (<p>, <div>, <br>), convert newlines to <br/>
        if (!processed.toLowerCase().contains("<p>") && !processed.toLowerCase().contains("<br")) {
            processed = processed.replace("\r\n", "\n").replace("\r", "\n").replace("\n", "<br/>");
        }

        return "<div style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b;\">"
                + processed
                + "</div>";
    }
}
