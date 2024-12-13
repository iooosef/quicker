package aoop.quicker.controller;

import aoop.quicker.model.PatientLog;
import aoop.quicker.service.PatientLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/*
 * PatientLogController
 * - to handle the patient logs
 * - Springboot REST controller
 */
@RestController
@RequestMapping("/patient-logs")
public class PatientLogController {
    private final Logger log = LoggerFactory.getLogger(PatientLogController.class);
    private final PatientLogService patientLogService;

    // Constructor for the PatientLogController
    // - allow dependency injection of the patient log service
    public PatientLogController(PatientLogService patientLogService) {
        this.patientLogService = patientLogService;
    }

    // Get all patient logs of an admission
    @RequestMapping(value="/all/{id}", produces= MediaType.APPLICATION_JSON_VALUE)
    public Page<PatientLog> getPatientLogsOfAdmission(@PathVariable int id, @RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size); // Create a pageable object
        // Get all patient logs of an admission by admission ID
        Page<PatientLog> patientLogs = patientLogService.getAllPatientLogsByAdmissionID(id, pageable);
        log.info(patientLogs.toString());
        return patientLogs;
    }

    // Get a patient log by ID
    @RequestMapping(value="/{id}", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getPatientLog(@PathVariable int id) {
        List errors = new ArrayList();
        // Validate the patient log ID
        if (!patientLogService.getPatientLogByID(id).isPresent()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "not_found_error");
            error.put("message", "Patient log not found");
            error.put("target", "model");
            errors.add(error);
            return ResponseEntity.status(404).body(errors);
        }
        return ResponseEntity.ok(patientLogService.getPatientLogByID(id).get());
    }

    // Add a patient log
    @PostMapping(value="/patient-log", produces= MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addPatientLog(@RequestBody PatientLog patientLog) {
        List errors = validatePatientLog(patientLog);
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        Instant now = Instant.now();
        patientLog.setPatientLogOn(now);
        patientLogService.addPatientLog(patientLog); // Add the patient log
        return ResponseEntity.ok(patientLog);
    }

    // Handles the validation of the patient log
    private List validatePatientLog(PatientLog patientLog) {
        List errors = new ArrayList();
        // Validate required fields
        if (patientLog.getAdmissionID() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Admission ID is required");
            error.put("target", "admissionID");
            errors.add(error);
        }
        if (patientLog.getPatientLogMsg() == null || patientLog.getPatientLogMsg().isEmpty()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Patient log message is required");
            error.put("target", "patientLogMsg");
            errors.add(error);
        }
        if (patientLog.getPatientLogBy() == null || patientLog.getPatientLogBy().isEmpty()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Patient log by is required");
            error.put("target", "patientLogBy");
            errors.add(error);
        }
        return errors;
    }
}
