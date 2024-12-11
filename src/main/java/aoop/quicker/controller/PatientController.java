package aoop.quicker.controller;

import aoop.quicker.model.Patient;
import aoop.quicker.service.PatientService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/patients")
public class PatientController {
    private final Logger log = LoggerFactory.getLogger(PatientController.class);
    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @RequestMapping(value="/all", produces= MediaType.APPLICATION_JSON_VALUE)
    public Page<Patient> getPatients(@RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Patient> patients = patientService.getAllPatients(pageable);
        log.info(patients.toString());
        return patients;
    }

    @RequestMapping(value="/search", produces=MediaType.APPLICATION_JSON_VALUE)
    public Page<Patient> searchPatients(@RequestParam String query, @RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Patient> patients = patientService.searchPatients(query, pageable);
        log.info(patients.toString());
        return patients;
    }

    @RequestMapping(value="/{id}", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getPatient(@PathVariable int id) {
        List errors = new ArrayList();
        if (!patientService.getPatientById(id).isPresent()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "not_found_error");
            error.put("message", "Patient not found");
            error.put("target", "model");
            errors.add(error);
            return ResponseEntity.status(404).body(errors);
        }
        return ResponseEntity.ok(patientService.getPatientById(id).get());
    }

    @PostMapping(value="/patient", produces= MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addPatient(@RequestBody Patient patient) {
        List errors = validatePatient(patient);
        boolean isPatientExists = patientService.isPatientExists(patient.getPatientFullName(), patient.getPatientGender(), patient.getPatientDOB());
        if (isPatientExists) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Patient already exists");
            error.put("target", "model");
            errors.add(error);
        }
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        Patient addedPatient = patientService.addPatient(patient);
        return ResponseEntity.ok(addedPatient);
    }

    @PutMapping(value="/patient/{id}", produces= MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updatePatient(@PathVariable int id, @RequestBody Patient patient) {
        List errors = validatePatient(patient);
        if (!patientService.getPatientById(id).isPresent()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "not_found_error");
            error.put("message", "Patient not found");
            error.put("target", "model");
            errors.add(error);
        }
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        Patient updatedPatient = patientService.updatePatient(id, patient);
        return ResponseEntity.ok(updatedPatient);
    }

    private List validatePatient(Patient model) {
        List errors = new ArrayList();
        if (model.getPatientFullName() == null || model.getPatientFullName().isEmpty()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Patient full name is required");
            error.put("target", "patientFullName");
            errors.add(error);
        }
        if (model.getPatientGender() == null || model.getPatientGender().isEmpty()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Patient gender is required");
            error.put("target", "patientGender");
            errors.add(error);
        }
        return errors;
    }
}
