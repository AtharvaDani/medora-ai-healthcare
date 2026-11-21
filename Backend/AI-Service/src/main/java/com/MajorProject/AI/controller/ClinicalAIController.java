package com.MajorProject.AI.controller;

import com.MajorProject.AI.Util.RedFlagDetector;
import com.MajorProject.AI.Util.helperForAI;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Structured (JSON) AI features:
 *  - /ai/explain-report : lab/medical report -> plain-language explanation
 *  - /ai/triage         : symptoms -> urgency + recommended specialty (with emergency detection)
 */
@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/ai")
public class ClinicalAIController {

    /** Specialities the app can search for - keeps the AI answer matchable with the doctor search. */
    static final List<String> SPECIALITIES = List.of(
            "General Physician", "Cardiologist", "Dermatologist", "Neurologist", "Orthopedic",
            "Pediatrician", "Gynecologist", "ENT", "Gastroenterologist", "Pulmonologist",
            "Psychiatrist", "Ophthalmologist", "Dentist", "Urologist", "Endocrinologist");

    private static final int MAX_REPORT_CHARS = 12000;

    private final helperForAI ai;
    private final RedFlagDetector redFlags;

    public ClinicalAIController(helperForAI ai, RedFlagDetector redFlags) {
        this.ai = ai;
        this.redFlags = redFlags;
    }

    // ------------------------------------------------------------------ report explainer
    @PostMapping("/explain-report")
    public Map<String, Object> explainReport(@RequestBody Map<String, String> body) {
        String content = body.getOrDefault("reportContent", "").trim();
        if (content.isEmpty()) {
            return Map.of("error", "The report has no readable text. Scanned images are not supported yet.");
        }
        boolean truncated = content.length() > MAX_REPORT_CHARS;
        if (truncated) content = content.substring(0, MAX_REPORT_CHARS);

        String system = """
                You are a careful medical report explainer for patients. You explain results in simple language.
                You never diagnose and never prescribe medicine. You only use values that appear in the report.
                Reply with ONE valid JSON object and nothing else.""";

        String user = """
                Explain this medical report. Return JSON with exactly these keys:
                {
                  "summary": "3-5 sentence plain-language overview",
                  "overallStatus": "NORMAL" | "ATTENTION" | "URGENT",
                  "findings": [
                    {"test": "name", "value": "value with unit", "referenceRange": "range or empty string",
                     "status": "NORMAL" | "HIGH" | "LOW" | "ABNORMAL",
                     "explanation": "one simple sentence on what it means"}
                  ],
                  "keyTakeaways": ["short bullet", "..."],
                  "lifestyleTips": ["general, safe tips"],
                  "questionsForDoctor": ["questions the patient could ask"],
                  "suggestedSpecialty": "one of: %s"
                }
                Put abnormal findings first. If the text is not a medical report, return
                {"error": "This does not look like a medical report."}.

                REPORT:
                """.formatted(String.join(", ", SPECIALITIES)) + content;

        try {
            Map<String, Object> result = ai.callAIForJson(system, user);
            if (result.isEmpty()) {
                return Map.of("error", "The AI could not produce a structured answer. Please try again.");
            }
            result.put("truncated", truncated);
            result.put("disclaimer", "AI-generated explanation for information only. It is not a diagnosis. Please consult a doctor.");
            return result;
        } catch (Exception e) {
            return Map.of("error", "AI service error: " + e.getMessage());
        }
    }

    // ------------------------------------------------------------------ symptom triage
    @PostMapping("/triage")
    public Map<String, Object> triage(@RequestBody Map<String, String> body) {
        String symptoms = body.getOrDefault("symptoms", "").trim();
        if (symptoms.isEmpty()) {
            return Map.of("error", "Please describe your symptoms.");
        }
        String age = body.getOrDefault("age", "");
        String gender = body.getOrDefault("gender", "");

        // 1) Deterministic emergency check - runs first, never depends on the AI.
        List<String> flags = redFlags.detect(symptoms);
        if (!flags.isEmpty()) {
            Map<String, Object> out = new LinkedHashMap<>();
            out.put("emergency", true);
            out.put("urgency", "EMERGENCY");
            out.put("redFlags", flags);
            out.put("specialty", "General Physician");
            out.put("reasoning", "Your description contains warning signs that may need immediate medical attention.");
            out.put("possibleConditions", List.of());
            out.put("selfCareTips", List.of());
            out.put("warningSigns", flags);
            out.put("disclaimer", "Call your local emergency number (112 in India) or go to the nearest emergency room now. Do not wait for an appointment.");
            return out;
        }

        // 2) AI triage
        String system = """
                You are a medical triage assistant for a clinic booking app. You do NOT diagnose.
                You judge how urgent the symptoms are and which type of doctor to see.
                Be cautious: if unsure between two urgency levels, pick the more urgent one.
                Reply with ONE valid JSON object and nothing else.""";
        String user = """
                Patient: age=%s, gender=%s
                Symptoms: %s

                Return JSON with exactly these keys:
                {
                  "urgency": "EMERGENCY" | "URGENT" | "ROUTINE" | "SELF_CARE",
                  "specialty": "exactly one of: %s",
                  "reasoning": "2-3 sentences, plain language",
                  "possibleConditions": ["up to 3 common possibilities, phrased as 'could be related to ...'"],
                  "selfCareTips": ["safe general tips while waiting for care"],
                  "warningSigns": ["symptoms that mean they should seek emergency care"]
                }
                """.formatted(age.isBlank() ? "unknown" : age, gender.isBlank() ? "unknown" : gender,
                symptoms, String.join(", ", SPECIALITIES));

        try {
            Map<String, Object> result = ai.callAIForJson(system, user);
            if (result.isEmpty()) {
                return Map.of("error", "The AI could not produce a structured answer. Please try again.");
            }
            String urgency = String.valueOf(result.getOrDefault("urgency", "ROUTINE")).toUpperCase(Locale.ROOT);
            result.put("urgency", urgency);
            result.put("emergency", urgency.equals("EMERGENCY"));
            result.put("redFlags", List.of());

            String specialty = String.valueOf(result.getOrDefault("specialty", "General Physician"));
            String matched = SPECIALITIES.stream().filter(s -> s.equalsIgnoreCase(specialty.trim()))
                    .findFirst().orElse("General Physician");
            result.put("specialty", matched);

            result.put("disclaimer", "AI triage is guidance, not a diagnosis. If you feel worse or are worried, seek medical care.");
            return result;
        } catch (Exception e) {
            return Map.of("error", "AI service error: " + e.getMessage());
        }
    }
}
