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

@RestController
@RequestMapping("/patient-logs")
public class PatientLogController {
    private final Logger log = LoggerFactory.getLogger(PatientLogController.class);
    private final PatientLogService patientLogService;

    public PatientLogController(PatientLogService patientLogService) {
        this.patientLogService = patientLogService;
    }

    @RequestMapping(value="/all/{id}", produces= MediaType.APPLICATION_JSON_VALUE)
    public Page<PatientLog> getPatientLogsOfAdmission(@PathVariable int id, @RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PatientLog> patientLogs = patientLogService.getAllPatientLogsByAdmissionID(id, pageable);
        log.info(patientLogs.toString());
        return patientLogs;
    }

    @RequestMapping(value="/{id}", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getPatientLog(@PathVariable int id) {
        List errors = new ArrayList();
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

    @PostMapping(value="/patient-log", produces= MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addPatientLog(@RequestBody PatientLog patientLog) {
        List errors = validatePatientLog(patientLog);
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        Instant now = Instant.now();
        patientLog.setPatientLogOn(now);
        patientLogService.addPatientLog(patientLog);
        return ResponseEntity.ok(patientLog);
    }

    private List validatePatientLog(PatientLog patientLog) {
        List errors = new ArrayList();
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
