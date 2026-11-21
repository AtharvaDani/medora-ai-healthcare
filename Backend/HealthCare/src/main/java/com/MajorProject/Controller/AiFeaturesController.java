package com.MajorProject.Controller;

import com.MajorProject.Service.ReportTextExtractor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Patient-facing AI features. Both endpoints require a logged-in user (JWT) and forward the
 * work to the AI-Service, so the AI API key never reaches the browser.
 */
@RestController
@RequestMapping("/Patient/ai")
public class AiFeaturesController {

    @Autowired
    private WebClient.Builder webClientBuilder;

    @Autowired
    private ReportTextExtractor extractor;

    @Value("${ai.service.url:http://localhost:8081}")
    private String aiServiceUrl;

    private static final long MAX_REPORT_BYTES = 10L * 1024 * 1024;

    /** Upload a report (PDF/DOCX/TXT) and get a plain-language explanation. Nothing is stored. */
    @PostMapping(value = "/explain-report", consumes = "multipart/form-data")
    public ResponseEntity<?> explainReport(@RequestParam("report") MultipartFile report) {
        if (report == null || report.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please choose a report file."));
        }
        if (report.getSize() > MAX_REPORT_BYTES) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is too large (max 10 MB)."));
        }
        String text;
        try {
            text = extractor.extract(report);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Could not read this file: " + e.getMessage()));
        }
        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error",
                    "No readable text found. Scanned/image-only reports are not supported yet."));
        }
        return forward("/ai/explain-report", Map.of("reportContent", text));
    }

    /** Describe symptoms -> urgency, recommended specialty, and emergency warning. */
    @PostMapping("/triage")
    public ResponseEntity<?> triage(@RequestBody Map<String, String> body) {
        String symptoms = body.getOrDefault("symptoms", "").trim();
        if (symptoms.length() < 3) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please describe your symptoms."));
        }
        if (symptoms.length() > 2000) {
            return ResponseEntity.badRequest().body(Map.of("error", "Description is too long (max 2000 characters)."));
        }
        Map<String, String> payload = new HashMap<>();
        payload.put("symptoms", symptoms);
        payload.put("age", body.getOrDefault("age", ""));
        payload.put("gender", body.getOrDefault("gender", ""));
        return forward("/ai/triage", payload);
    }

    @SuppressWarnings("unchecked")
    private ResponseEntity<?> forward(String path, Map<String, String> payload) {
        try {
            Map<String, Object> result = webClientBuilder.build().post()
                    .uri(aiServiceUrl + path)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(150))
                    .block();
            if (result != null && result.containsKey("error")) {
                return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(result);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("error",
                    "AI service is unavailable. Make sure the AI-Service is running on port 8081. (" + e.getMessage() + ")"));
        }
    }
}
