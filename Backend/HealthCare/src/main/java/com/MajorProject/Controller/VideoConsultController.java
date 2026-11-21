package com.MajorProject.Controller;

import com.MajorProject.Entity.Appointment;
import com.MajorProject.Entity.User;
import com.MajorProject.Repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Video consultation. Each appointment gets its own Jitsi room. The room name is an HMAC of the
 * appointment id, so it cannot be guessed, and only the patient or the doctor of that appointment
 * can ask for it.
 */
@RestController
@RequestMapping("/Appointment")
public class VideoConsultController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Value("${consultation.room-secret:change-this-secret-in-production}")
    private String roomSecret;

    @Value("${consultation.jitsi-domain:meet.jit.si}")
    private String jitsiDomain;

    @GetMapping("/{appointmentId}/video-room")
    public ResponseEntity<?> getRoom(@PathVariable long appointmentId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        Optional<Appointment> opt = appointmentRepository.findById(appointmentId);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Appointment not found"));
        }
        Appointment appt = opt.get();

        boolean isPatient = appt.getPatient() != null && appt.getPatient().getId() == user.getId();
        boolean isDoctor = appt.getDoctor() != null && appt.getDoctor().getId() == user.getId();
        if (!isPatient && !isDoctor) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You are not a participant of this appointment."));
        }

        String room = "medora-" + hmac(String.valueOf(appointmentId)).substring(0, 20);
        String displayName = isDoctor ? "Dr. " + appt.getDoctor().getName() : appt.getPatient().getName();

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("appointmentId", appointmentId);
        out.put("roomName", room);
        out.put("domain", jitsiDomain);
        out.put("url", "https://" + jitsiDomain + "/" + room);
        out.put("role", isDoctor ? "Doctor" : "Patient");
        out.put("displayName", displayName);
        out.put("doctorName", appt.getDoctor().getName());
        out.put("patientName", appt.getPatient().getName());
        if (appt.getAvailability() != null) {
            out.put("scheduledAt", appt.getAvailability().getDatetime().toString());
        }
        return ResponseEntity.ok(out);
    }

    private String hmac(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(roomSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : raw) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Could not create room name", e);
        }
    }
}
