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

/*
 * PatientController
 *  - Handles patient related requests
 *  - Spring Boot REST Controller
 */
@RestController
@RequestMapping("/patients")
public class PatientController {
    private final Logger log = LoggerFactory.getLogger(PatientController.class);
    private final PatientService patientService;

    // Constructor for PatientController
    // - allows dependency injection of PatientService
    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    // Handles GET request for all patients
    @RequestMapping(value="/all", produces= MediaType.APPLICATION_JSON_VALUE)
    public Page<Patient> getPatients(@RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size); // Create Pageable object
        Page<Patient> patients = patientService.getAllPatients(pageable); // Get all patients as Page object
        log.info(patients.toString());
        return patients;
    }

    // Handles GET request for searching patients
    @RequestMapping(value="/search", produces=MediaType.APPLICATION_JSON_VALUE)
    public Page<Patient> searchPatients(@RequestParam String query, @RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size); // Create Pageable object
        // Get patients using query and pageable as a page object
        Page<Patient> patients = patientService.searchPatients(query, pageable);
        log.info(patients.toString());
        return patients;
    }

    // Handles GET request for a specific patient
    @RequestMapping(value="/{id}", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getPatient(@PathVariable int id) {
        List errors = new ArrayList();
        // Validate if patient exists
        if (!patientService.getPatientById(id).isPresent()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "not_found_error");
            error.put("message", "Patient not found");
            error.put("target", "model");
            errors.add(error);
            return ResponseEntity.status(404).body(errors);
        }
        return ResponseEntity.ok(patientService.getPatientById(id).get()); // Return patient
    }

    // Handles POST request for adding a patient
    @PostMapping(value="/patient", produces= MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addPatient(@RequestBody Patient patient) {
        List errors = validatePatient(patient); // Validate patient
        boolean isPatientExists = patientService.isPatientExists(patient.getPatientFullName(), patient.getPatientGender(), patient.getPatientDOB());
        // Check if patient already exists
        if (isPatientExists) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Patient already exists");
            error.put("target", "model");
            errors.add(error);
        }
        if (!errors.isEmpty()) { // return any/all errors
            return ResponseEntity.status(400).body(errors);
        }
        Patient addedPatient = patientService.addPatient(patient); // Add patient
        return ResponseEntity.ok(addedPatient);
    }

    // Handles PUT request for updating a patient
    @PutMapping(value="/patient/{id}", produces= MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updatePatient(@PathVariable int id, @RequestBody Patient patient) {
        List errors = validatePatient(patient); // Validate patient
        // Validate if patient exists
        if (!patientService.getPatientById(id).isPresent()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "not_found_error");
            error.put("message", "Patient not found");
            error.put("target", "model");
            errors.add(error);
        }
        if (!errors.isEmpty()) { // return any/all errors
            return ResponseEntity.status(400).body(errors);
        }
        Patient updatedPatient = patientService.updatePatient(id, patient); // Update patient
        return ResponseEntity.ok(updatedPatient);
    }

    // Helper method to validate patient
    private List validatePatient(Patient model) {
        List errors = new ArrayList();
        // validate required fields
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
