package com.MajorProject.Service;

import com.MajorProject.Entity.Appointment;
import com.MajorProject.Entity.Doctor;
import com.MajorProject.Entity.Feedback;
import com.MajorProject.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Builds the numbers behind the analytics dashboards. Aggregation is done in memory,
 * which is plenty for the size of this app and keeps it independent of the SQL dialect.
 */
@Service
public class AnalyticsService {

    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private DoctorRepository doctorRepository;
    @Autowired private PatientRepository patientRepository;
    @Autowired private FeedbackRepository feedbackRepository;
    @Autowired private DoctorAvailabilityRepository availabilityRepository;

    public Map<String, Object> adminOverview() {
        List<Appointment> appts = appointmentRepository.findAll();
        List<Feedback> feedbacks = feedbackRepository.findAll();
        List<Doctor> doctors = doctorRepository.findAll();

        Map<String, Object> out = new LinkedHashMap<>();

        Map<String, Object> totals = new LinkedHashMap<>();
        totals.put("doctors", doctors.size());
        totals.put("patients", patientRepository.count());
        totals.put("appointments", appts.size());
        totals.put("reviews", feedbacks.size());
        totals.put("averageRating", round(avgRating(feedbacks)));
        long slots = availabilityRepository.count();
        long booked = availabilityRepository.findAll().stream().filter(a -> a.isBooked()).count();
        totals.put("slots", slots);
        totals.put("bookingRate", slots == 0 ? 0 : Math.round(booked * 100.0 / slots));
        out.put("totals", totals);

        out.put("appointmentsByDay", byDay(appts));
        out.put("appointmentsByStatus", byStatus(appts));
        out.put("appointmentsByHour", byHour(appts));
        out.put("ratingDistribution", ratingDistribution(feedbacks));
        out.put("appointmentsBySpeciality", bySpeciality(appts));
        out.put("topDoctors", topDoctors(doctors, feedbacks, appts));
        return out;
    }

    public Map<String, Object> doctorOverview(long doctorId) {
        List<Appointment> appts = appointmentRepository.findAll().stream()
                .filter(a -> a.getDoctor() != null && a.getDoctor().getId() == doctorId)
                .collect(Collectors.toList());
        List<Feedback> feedbacks = feedbackRepository.findByDoctor_Id(doctorId);

        Map<String, Object> out = new LinkedHashMap<>();
        Map<String, Object> totals = new LinkedHashMap<>();
        LocalDate today = LocalDate.now();
        totals.put("appointments", appts.size());
        totals.put("upcoming", appts.stream().filter(a -> a.getAvailability() != null
                && !a.getAvailability().getDate().isBefore(today)).count());
        totals.put("uniquePatients", appts.stream().filter(a -> a.getPatient() != null)
                .map(a -> a.getPatient().getId()).distinct().count());
        totals.put("reviews", feedbacks.size());
        totals.put("averageRating", round(avgRating(feedbacks)));
        out.put("totals", totals);

        out.put("appointmentsByDay", byDay(appts));
        out.put("appointmentsByStatus", byStatus(appts));
        out.put("appointmentsByHour", byHour(appts));
        out.put("ratingDistribution", ratingDistribution(feedbacks));
        return out;
    }

    // ---------------------------------------------------------------- helpers

    /** Last 14 days + next 7 days, zero-filled so the chart has no gaps. */
    private List<Map<String, Object>> byDay(List<Appointment> appts) {
        LocalDate today = LocalDate.now();
        Map<LocalDate, Long> counts = appts.stream()
                .filter(a -> a.getAvailability() != null && a.getAvailability().getDate() != null)
                .collect(Collectors.groupingBy(a -> a.getAvailability().getDate(), Collectors.counting()));
        List<Map<String, Object>> list = new ArrayList<>();
        for (LocalDate d = today.minusDays(13); !d.isAfter(today.plusDays(7)); d = d.plusDays(1)) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("date", d.toString());
            row.put("count", counts.getOrDefault(d, 0L));
            list.add(row);
        }
        return list;
    }

    private List<Map<String, Object>> byStatus(List<Appointment> appts) {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (Appointment.AppointmentStatus s : Appointment.AppointmentStatus.values()) counts.put(s.getStatus(), 0L);
        for (Appointment a : appts) {
            if (a.getStatus() != null) counts.merge(a.getStatus().getStatus(), 1L, Long::sum);
        }
        return toRows(counts, "status");
    }

    /** Appointments by hour of day (0-23). */
    private List<Map<String, Object>> byHour(List<Appointment> appts) {
        long[] hours = new long[24];
        for (Appointment a : appts) {
            if (a.getAvailability() != null && a.getAvailability().getTime() != null) {
                hours[a.getAvailability().getTime().getHour()]++;
            }
        }
        List<Map<String, Object>> list = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("hour", h);
            row.put("label", String.format("%02d:00", h));
            row.put("count", hours[h]);
            list.add(row);
        }
        return list;
    }

    private List<Map<String, Object>> ratingDistribution(List<Feedback> feedbacks) {
        long[] stars = new long[6];
        for (Feedback f : feedbacks) {
            if (f.getRating() >= 1 && f.getRating() <= 5) stars[f.getRating()]++;
        }
        List<Map<String, Object>> list = new ArrayList<>();
        for (int s = 1; s <= 5; s++) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("stars", s + "★");
            row.put("count", stars[s]);
            list.add(row);
        }
        return list;
    }

    private List<Map<String, Object>> bySpeciality(List<Appointment> appts) {
        Map<String, Long> counts = appts.stream()
                .filter(a -> a.getDoctor() != null && a.getDoctor().getSpeciality() != null)
                .collect(Collectors.groupingBy(a -> a.getDoctor().getSpeciality().trim(), Collectors.counting()));
        Map<String, Long> top = counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(8)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a, LinkedHashMap::new));
        return toRows(top, "speciality");
    }

    private List<Map<String, Object>> topDoctors(List<Doctor> doctors, List<Feedback> feedbacks, List<Appointment> appts) {
        Map<Long, List<Feedback>> byDoctor = feedbacks.stream()
                .filter(f -> f.getDoctor() != null)
                .collect(Collectors.groupingBy(f -> f.getDoctor().getId()));
        Map<Long, Long> apptCount = appts.stream()
                .filter(a -> a.getDoctor() != null)
                .collect(Collectors.groupingBy(a -> a.getDoctor().getId(), Collectors.counting()));

        List<Map<String, Object>> rows = new ArrayList<>();
        for (Doctor d : doctors) {
            List<Feedback> fs = byDoctor.getOrDefault(d.getId(), List.of());
            if (fs.isEmpty()) continue;
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("doctorId", d.getId());
            row.put("name", d.getName());
            row.put("speciality", d.getSpeciality());
            row.put("rating", round(avgRating(fs)));
            row.put("reviews", fs.size());
            row.put("appointments", apptCount.getOrDefault(d.getId(), 0L));
            rows.add(row);
        }
        rows.sort((a, b) -> {
            int c = Double.compare((double) b.get("rating"), (double) a.get("rating"));
            return c != 0 ? c : Integer.compare((int) b.get("reviews"), (int) a.get("reviews"));
        });
        return rows.stream().limit(5).collect(Collectors.toList());
    }

    private List<Map<String, Object>> toRows(Map<String, Long> counts, String key) {
        List<Map<String, Object>> list = new ArrayList<>();
        counts.forEach((k, v) -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put(key, k);
            row.put("count", v);
            list.add(row);
        });
        return list;
    }

    private double avgRating(List<Feedback> fs) {
        return fs.stream().mapToInt(Feedback::getRating).average().orElse(0);
    }

    private double round(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}
