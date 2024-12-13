package aoop.quicker.controller;

import aoop.quicker.model.PatientConsent;
import aoop.quicker.service.PatientConsentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

/*
 * PatientConsentController class
 *  - Handles patient consent requests
 *  - Spring Boot REST Controller
 */
@RestController
@RequestMapping("/patient-consents")
public class PatientConsentController {
    private final Logger log = LoggerFactory.getLogger(PatientConsentController.class);
    private final PatientConsentService patientConsentService;

    // Constructor for PatientConsentController
    // - allow dependency injection for PatientConsentService
    public PatientConsentController(PatientConsentService patientConsentService) {
        this.patientConsentService = patientConsentService;
    }

    // Handle GET request for all patient consents
    @RequestMapping(value="/all", produces= MediaType.APPLICATION_JSON_VALUE)
    public Page<PatientConsent> getPatientConsents(@RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size); // Create Pageable object
        // Get all patient consents as a Page object
        Page<PatientConsent> patientConsents = patientConsentService.getAllPatientConsents(pageable);
        log.info(patientConsents.toString());
        return patientConsents;
    }

    // Handle GET request for a specific patient consent
    @RequestMapping(value="/{admissionId}", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getPatientConsent(@RequestParam int admissionId) {
        List errors = new ArrayList();
        Optional<PatientConsent> patientConsent = patientConsentService.getPatientConsentByAdmissionId(admissionId);
        // Validate if patient consent exists
        if (!patientConsent.isPresent()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "not_found_error");
            error.put("message", "Patient consent not found");
            error.put("target", "model");
            errors.add(error);
            return ResponseEntity.status(404).body(errors);
        }
        return ResponseEntity.ok(patientConsent.get());
    }

    // Handle POST request to add a patient consent
    @PostMapping(value="/patient-consent", produces= MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addPatientConsent(@RequestBody PatientConsent patientConsent) {
        List errors = validateModel(patientConsent); // Validate patient consent model
        boolean exists = patientConsentService.getPatientConsentByAdmissionId(patientConsent.getAdmissionID()).isPresent();
        // Validate if patient consent already exists
        if (exists) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Patient consent already exists for this ER admission");
            error.put("target", "admissionID");
            errors.add(error);
        }
        if (!errors.isEmpty()) { // return any/all errors
            return ResponseEntity.status(400).body(errors);
        }
        return ResponseEntity.ok(patientConsentService.addPatientConsent(patientConsent)); // Add patient consent
    }

    // helper method to validate patient consent model
    private List validateModel(PatientConsent patientConsent) {
        List errors = new ArrayList();
        // Validate required fields
        if (patientConsent.getAdmissionID() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Admission ID is required");
            error.put("target", "admissionID");
            errors.add(error);
        }
        if (patientConsent.getConsentSignedOn() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Consent signed on is required");
            error.put("target", "consentSignedOn");
            errors.add(error);
        }
        if (patientConsent.getConsentSignature() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Consent signature is required");
            error.put("target", "consentSignature");
            errors.add(error);
        }
        return errors;
    }

}
