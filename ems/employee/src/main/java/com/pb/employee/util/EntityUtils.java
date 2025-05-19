package com.pb.employee.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Slf4j
@Component
public class EntityUtils {

    private final WebClient webClient; // Instance variable, not static

    // Constructor injection for WebClient and baseUrl
    @Autowired
    public EntityUtils(WebClient.Builder webClientBuilder, @Value("${invoice.service.baseUrl}") String baseUrl) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build(); // Initialize WebClient with base URL
    }

    // Send POST request using WebClient
    public ResponseEntity<String> sendPostRequest(String authToken, Object request,
            String uri) throws WebClientResponseException {

        try {
            return webClient.post()
                    .uri(uri)
                    .header(Constants.AUTH_KEY, authToken)
                    .bodyValue(request)
                    .retrieve()
                    .toEntity(String.class)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("WebClient error - Status: {}, Body: {}", e.getRawStatusCode(), e.getResponseBodyAsString());
            log.error("Request URI: {}", uri);
            log.error("Request body: {}", request);  // This will log the full request body
            return ResponseEntity.status(e.getRawStatusCode())
                    .body(e.getResponseBodyAsString());
        }
    }

    public ResponseEntity<String> getRequest(String authToken,String uri)
            throws WebClientResponseException {

        try {
            return webClient.get()
                    .uri(uri)
                    .header(Constants.AUTH_KEY, authToken)
                    .retrieve()
                    .toEntity(String.class)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("WebClient error - Status: {}, Body: {}", e.getRawStatusCode(), e.getResponseBodyAsString());
            log.error("Request URI: {}", uri);
            return ResponseEntity.status(e.getRawStatusCode())
                    .body(e.getResponseBodyAsString());
        }
    }

    public ResponseEntity<byte[]> getPdfRequest(String authToken, String uri)
            throws WebClientResponseException {

        try {
            byte[] pdfData = webClient.get()
                    .uri(uri)
                    .header(Constants.AUTH_KEY, authToken)
                    .retrieve()
                    .toEntity(byte[].class)  // Handling binary response (PDF)
                    .block()
                    .getBody();

            // Return the PDF as a response with the correct content type
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfData);  // Send the PDF binary data

        } catch (WebClientResponseException e) {
            log.error("WebClient error - Status: {}, Body: {}", e.getRawStatusCode(), e.getResponseBodyAsString());
            log.error("Request URI: {}", uri);
            return ResponseEntity.status(e.getRawStatusCode())
                    .body(e.getResponseBodyAsString().getBytes());  // Ensure byte[] is returned in case of error
        }
    }

    public ResponseEntity<String> sendPatchRequest(
            String authToken,
            Object request,
            String uri) throws WebClientResponseException {

        try {
            return webClient.patch()
                    .uri(uri)
                    .header(Constants.AUTH_KEY, authToken)
                    .bodyValue(request)
                    .retrieve()
                    .toEntity(String.class)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("WebClient error - Status: {}, Body: {}", e.getRawStatusCode(), e.getResponseBodyAsString());
            log.error("Request URI: {}", uri);
            log.error("Request body: {}", request);  // This will log the full request body
            return ResponseEntity.status(e.getRawStatusCode())
                    .body(e.getResponseBodyAsString());
        }
    }

    public ResponseEntity<?> deleteRequest(String authToken, String uri) {
        try {
            return webClient.delete()
                    .uri(uri)
                    .header(Constants.AUTH_KEY, authToken)
                    .retrieve()
                    .toEntity(String.class)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("WebClient error - Status: {}, Body: {}", e.getRawStatusCode(), e.getResponseBodyAsString());
            log.error("Request URI: {}", uri);
            return ResponseEntity.status(e.getRawStatusCode())
                    .body(e.getResponseBodyAsString());
        }
    }
}
