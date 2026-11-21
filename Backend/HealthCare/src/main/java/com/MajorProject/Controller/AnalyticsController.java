package com.MajorProject.Controller;

import com.MajorProject.Entity.User;
import com.MajorProject.Service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/** Dashboard data. Admins see platform-wide numbers; a doctor sees only their own. */
@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analytics;

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.getPrincipal() instanceof User u) ? u : null;
    }

    @GetMapping("/admin")
    public ResponseEntity<?> admin() {
        User u = currentUser();
        if (u == null || !"Admin".equalsIgnoreCase(u.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admins only"));
        }
        return ResponseEntity.ok(analytics.adminOverview());
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> doctor(@PathVariable long doctorId) {
        User u = currentUser();
        boolean admin = u != null && "Admin".equalsIgnoreCase(u.getRole());
        boolean self = u != null && "Doctor".equalsIgnoreCase(u.getRole()) && u.getId() == doctorId;
        if (!admin && !self) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not allowed"));
        }
        return ResponseEntity.ok(analytics.doctorOverview(doctorId));
    }
}
