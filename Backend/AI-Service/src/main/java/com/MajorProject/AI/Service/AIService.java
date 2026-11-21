package com.MajorProject.AI.Service;

import com.MajorProject.AI.Util.helperForAI;
import com.MajorProject.common.Domain.AIResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AIService {

    private final helperForAI helperForAI;
    private final ObjectMapper objectMapper;

    public AIService(helperForAI helperForAI, ObjectMapper objectMapper) {
        this.helperForAI = helperForAI;
        this.objectMapper = objectMapper;
    }

    /**
     * Analyze all feedback comments of a doctor and generate:
     * - summary (general sentiment and points)
     * - key improvement suggestions
     * - satisfactionScore (0–100)
     */
    public AIResponse analyzeFeedback(String combinedFeedback) {
        try {
            if (combinedFeedback == null || combinedFeedback.isBlank()) {
                return new AIResponse("No feedback available", Collections.emptyList(), 0.0);
            }

            String prompt = """
                    You are a professional AI that analyzes patient feedback for doctors.
                    
                    Analyze the following feedback comments about a doctor and return JSON in this structure:
                    {
                      "summary": "A 3-5 line overview of how patients feel about the doctor (tone, qualities, etc).",
                      "suggestions": ["list of improvement suggestions if any"],
                      "healthScore": <a number between 0 and 100 representing average patient satisfaction>
                    }

                    Feedback comments:
                    """ + combinedFeedback;

            String content = helperForAI.callAI(prompt);
            return helperForAI.parseAIResponseSafely(content);

        } catch (Exception e) {
            e.printStackTrace();
            return new AIResponse("Error analyzing feedback", List.of("Check logs for more details"), null);
        }
    }
}

