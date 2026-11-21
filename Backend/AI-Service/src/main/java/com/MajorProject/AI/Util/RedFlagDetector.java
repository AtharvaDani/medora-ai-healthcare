package com.MajorProject.AI.Util;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Rule-based emergency detection. This runs BEFORE the AI model so that life-threatening
 * symptoms always get an emergency warning, even if the AI is slow, down or gets it wrong.
 */
@Component
public class RedFlagDetector {

    private record Rule(String label, Pattern pattern) {}

    private static Rule r(String label, String regex) {
        return new Rule(label, Pattern.compile(regex, Pattern.CASE_INSENSITIVE));
    }

    private static final List<Rule> RULES = List.of(
            r("Chest pain / possible heart attack", "chest (pain|pressure|tightness)|pain in (my )?chest|heart attack|crushing chest"),
            r("Breathing difficulty", "(can'?t|cannot|unable to|difficulty|trouble|struggling to) breath|short(ness)? of breath|gasping|choking"),
            r("Possible stroke", "stroke|face (is )?droop|slurred speech|sudden (weakness|numbness)|one side of (my )?(body|face)|sudden confusion"),
            r("Severe bleeding", "severe bleeding|bleeding (heavily|won'?t stop|a lot)|vomiting blood|coughing (up )?blood|blood in (stool|vomit)"),
            r("Loss of consciousness / seizure", "unconscious|passed out|fainted|not responding|seizure|convulsion"),
            r("Self-harm / suicidal thoughts", "suicid|kill myself|end my life|want to die|self[- ]harm"),
            r("Severe allergic reaction", "anaphyla|throat (is )?(closing|swelling)|swollen (tongue|throat)|severe allergic"),
            r("Poisoning / overdose", "overdose|poison|swallowed (bleach|pills)"),
            r("Severe head injury", "severe head (injury|trauma)|head injury.*(vomit|unconscious)")
    );

    public List<String> detect(String text) {
        List<String> hits = new ArrayList<>();
        if (text == null) return hits;
        String t = text.toLowerCase(Locale.ROOT);
        for (Rule rule : RULES) {
            if (rule.pattern().matcher(t).find()) hits.add(rule.label());
        }
        return hits;
    }
}
