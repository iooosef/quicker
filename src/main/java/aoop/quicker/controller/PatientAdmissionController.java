package aoop.quicker.controller;

import aoop.quicker.model.PatientAdmission;
import aoop.quicker.service.PatientAdmissionService;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/patients")
public class PatientAdmissionController {
    private final Logger log = LoggerFactory.getLogger(PatientAdmissionController.class);
    private final PatientAdmissionService patientAdmissionService;
    private final Duration DUPLICATE_CHECK_TRERESHOLD = Duration.ofMinutes(90);

    public PatientAdmissionController(PatientAdmissionService patientAdmissionService) {
        this.patientAdmissionService = patientAdmissionService;
    }

    @RequestMapping(value="/all", produces= MediaType.APPLICATION_JSON_VALUE)
    public Page<PatientAdmission> getPatientAdmissions(@RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PatientAdmission> patients = patientAdmissionService.getAllPatientAdmissions(pageable);
        log.info(patients.toString());
        return patients;
    }

    @RequestMapping(value="/search", produces=MediaType.APPLICATION_JSON_VALUE)
    public Page<PatientAdmission> searchPatientAdmissions(@RequestParam String query, @RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PatientAdmission> patients = patientAdmissionService.searchPatientAdmissions(query, pageable);
        log.info(patients.toString());
        return patients;
    }

    @RequestMapping(value="/{id}", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getPatientAdmission(@PathVariable int id) {
        List errors = new ArrayList();
        if (!patientAdmissionService.getPatientAdmissionById(id).isPresent()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "not_found_error");
            error.put("message", "Patient not found");
            error.put("target", "model");
            errors.add(error);
            return ResponseEntity.status(404).body(errors);
        }
        return ResponseEntity.ok(patientAdmissionService.getPatientAdmissionById(id).get());
    }

    @PostMapping(value="/add", produces= MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addPatient(@RequestBody PatientAdmission model) {
        List errors = validatePatient(model, true);
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        PatientAdmission patient = patientAdmissionService.addPatientAdmission(model);
        return ResponseEntity.ok(patient);
    }

    @PostMapping(value="/add/force", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addPatientForce(@RequestBody PatientAdmission model, @RequestParam boolean force) {
        List errors = validatePatient(model, true);
        if (!force) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Force parameter is false");
            error.put("target", "force");
            errors.add(error);
        }
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        PatientAdmission patient = patientAdmissionService.addPatientAdmission(model);
        return ResponseEntity.ok(patient);
    }

    @PutMapping(value="/update/{id}", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updatePatient(@PathVariable int id, @RequestBody PatientAdmission model) {
        List errors = validatePatient(model, false);
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        PatientAdmission patient = patientAdmissionService.updatePatientAdmission(id, model);
        return ResponseEntity.ok(patient);
    }

    private List validatePatient(PatientAdmission model, boolean isAdd) {
        List errors = new ArrayList();
        if (model.getPatientName() == null || model.getPatientName().isEmpty()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Patient name is required. If unknown, use descriptive name");
            error.put("target", "patientName");
            errors.add(error);
        }
        if (model.getPatientTriage() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Patient triage is required");
            error.put("target", "patientTriage");
            errors.add(error);
        }
        if (model.getPatientStatus() == null || model.getPatientStatus().isEmpty()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Patient status is required");
            error.put("target", "patientStatus");
            errors.add(error);
        }
        if (model.getPatientBedLocCode() == null || model.getPatientBedLocCode().isEmpty()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Patient bed location code is required");
            error.put("target", "patientBedLocCode");
            errors.add(error);
        }
        if (isAdd) {
            boolean isNewPatientDuplicate = patientAdmissionService.isPatientAdmissionAddedInTheLast(model.getPatientName(), DUPLICATE_CHECK_TRERESHOLD);
            if (isNewPatientDuplicate) {
                HashMap<String, String> error = new HashMap<>();
                error.put("type", "validation_error");
                error.put("message", "Patient with the same name was added in the last " + DUPLICATE_CHECK_TRERESHOLD.toMinutes() + " minutes");
                error.put("target", "patientName");
                errors.add(error);
            }
        }
        return errors;
    }

}
