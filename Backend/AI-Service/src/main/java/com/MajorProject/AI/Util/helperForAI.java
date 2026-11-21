package com.MajorProject.AI.Util;

import com.MajorProject.common.Domain.AIResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import java.util.function.Consumer;

/**
 * Talks to any OpenAI-compatible chat completions API (Groq, Google Gemini, OpenRouter, ...).
 * Provider is selected with ai.api.base-url / ai.api.model / ai.api.key in application.properties.
 */
@Component
public class helperForAI {

    private final ObjectMapper objectMapper;
    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    @Value("${ai.api.key}")
    private String apiKey;

    @Value("${ai.api.base-url}")
    private String baseUrl;

    @Value("${ai.api.model}")
    private String model;

    @Value("${ai.api.temperature:0.7}")
    private double temperature;

    public helperForAI(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    private HttpRequest buildRequest(String systemPrompt, String userPrompt, boolean stream) throws IOException {
        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("PASTE_YOUR")) {
            throw new IOException("AI API key is not set. Set AI_API_KEY env variable or ai.api.key in application.properties");
        }

        List<Map<String, String>> messages = new ArrayList<>();
        if (systemPrompt != null && !systemPrompt.isBlank()) {
            messages.add(Map.of("role", "system", "content", systemPrompt));
        }
        messages.add(Map.of("role", "user", "content", userPrompt));

        String body = objectMapper.writeValueAsString(Map.of(
                "model", model,
                "stream", stream,
                "temperature", temperature,
                "messages", messages
        ));

        String url = baseUrl.endsWith("/") ? baseUrl + "chat/completions" : baseUrl + "/chat/completions";

        return HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(120))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
    }

    private IOException statusError(int status, String body) {
        String hint = switch (status) {
            case 401, 403 -> " (invalid API key)";
            case 429 -> " (free-tier rate limit reached, wait a minute and retry)";
            default -> "";
        };
        return new IOException("AI API returned status " + status + hint + ": " + body);
    }

    /** Non-streaming call. Returns only the assistant's text (message content). */
    public String callAI(String prompt) throws IOException, InterruptedException {
        HttpResponse<String> response = client.send(buildRequest(null, prompt, false),
                HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw statusError(response.statusCode(), response.body());
        }
        JsonNode root = objectMapper.readTree(response.body());
        return root.path("choices").path(0).path("message").path("content").asText("");
    }

    /** Non-streaming call with a system prompt. Returns only the assistant's text. */
    public String callAI(String systemPrompt, String userPrompt) throws IOException, InterruptedException {
        HttpResponse<String> response = client.send(buildRequest(systemPrompt, userPrompt, false),
                HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw statusError(response.statusCode(), response.body());
        }
        JsonNode root = objectMapper.readTree(response.body());
        return root.path("choices").path(0).path("message").path("content").asText("");
    }

    /** Calls the AI and parses the JSON object in its reply into a Map. Returns an empty map on bad JSON. */
    @SuppressWarnings("unchecked")
    public Map<String, Object> callAIForJson(String systemPrompt, String userPrompt)
            throws IOException, InterruptedException {
        String reply = callAI(systemPrompt, userPrompt);
        try {
            return objectMapper.readValue(extractJson(reply), Map.class);
        } catch (Exception e) {
            System.err.println("AI returned invalid JSON: " + e.getMessage());
            return new LinkedHashMap<>();
        }
    }

    /** Streaming call. Calls onToken for every piece of text as it arrives. */
    public void streamAI(String systemPrompt, String userPrompt, Consumer<String> onToken)
            throws IOException, InterruptedException {
        HttpResponse<java.io.InputStream> response = client.send(buildRequest(systemPrompt, userPrompt, true),
                HttpResponse.BodyHandlers.ofInputStream());

        if (response.statusCode() != 200) {
            String err = new String(response.body().readAllBytes(), StandardCharsets.UTF_8);
            throw statusError(response.statusCode(), err);
        }

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(response.body(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (!line.startsWith("data:")) continue;
                String data = line.substring(5).trim();
                if (data.isEmpty()) continue;
                if (data.equals("[DONE]")) break;
                try {
                    JsonNode token = objectMapper.readTree(data).path("choices").path(0).path("delta").path("content");
                    if (!token.isMissingNode() && !token.isNull() && !token.asText().isEmpty()) {
                        onToken.accept(token.asText());
                    }
                } catch (IOException ignored) {
                    // skip malformed chunk
                }
            }
        }
    }

    /** Extracts the JSON object from a model reply (removes ```json fences / extra text). */
    public String extractJson(String text) {
        if (text == null) return "{}";
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start >= 0 && end > start) return text.substring(start, end + 1);
        return text;
    }

    public List<String> chunkText(String text, int chunkSize) {
        List<String> chunks = new ArrayList<>();
        int start = 0;
        while (start < text.length()) {
            int end = Math.min(start + chunkSize, text.length());
            chunks.add(text.substring(start, end));
            start = end;
        }
        return chunks;
    }

    public AIResponse parseAIResponseSafely(String json) {
        try {
            Map<String, Object> map = objectMapper.readValue(extractJson(json), Map.class);

            String summary = map.getOrDefault("summary", "").toString();

            List<String> suggestions = new ArrayList<>();
            Object sugObj = map.get("suggestions");
            if (sugObj instanceof List<?> list) {
                for (Object o : list) {
                    suggestions.add(o.toString());
                }
            }

            Double healthScore = null;
            Object scoreObj = map.get("healthScore");
            if (scoreObj instanceof Number num) {
                healthScore = num.doubleValue();
            }

            return new AIResponse(summary, suggestions, healthScore);

        } catch (Exception e) {
            e.printStackTrace();
            return new AIResponse(
                    "Error parsing AI response.",
                    List.of("AI returned invalid JSON."),
                    null
            );
        }
    }
}
