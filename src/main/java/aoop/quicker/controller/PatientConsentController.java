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

@RestController
@RequestMapping("/patient-consents")
public class PatientConsentController {
    private final Logger log = LoggerFactory.getLogger(PatientConsentController.class);
    private final PatientConsentService patientConsentService;

    public PatientConsentController(PatientConsentService patientConsentService) {
        this.patientConsentService = patientConsentService;
    }

    @RequestMapping(value="/all", produces= MediaType.APPLICATION_JSON_VALUE)
    public Page<PatientConsent> getPatientConsents(@RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PatientConsent> patientConsents = patientConsentService.getAllPatientConsents(pageable);
        log.info(patientConsents.toString());
        return patientConsents;
    }

    @RequestMapping(value="/{admissionId}", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getPatientConsent(@RequestParam int admissionId) {
        List errors = new ArrayList();
        Optional<PatientConsent> patientConsent = patientConsentService.getPatientConsentByAdmissionId(admissionId);
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

    @PostMapping(value="/patient-consent", produces= MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addPatientConsent(@RequestBody PatientConsent patientConsent) {
        List errors = validateModel(patientConsent);
        boolean exists = patientConsentService.getPatientConsentByAdmissionId(patientConsent.getAdmissionID()).isPresent();
        if (exists) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Patient consent already exists for this ER admission");
            error.put("target", "admissionID");
            errors.add(error);
        }
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        return ResponseEntity.ok(patientConsentService.addPatientConsent(patientConsent));
    }

    private List validateModel(PatientConsent patientConsent) {
        List errors = new ArrayList();
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
