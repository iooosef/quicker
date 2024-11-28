package aoop.quicker.controller;

import aoop.quicker.model.PatientsPhilHealth;
import aoop.quicker.service.PatientsPhilHealthService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/patients-philhealth")
public class PatientsPhilHealthController {
    private final Logger log = LoggerFactory.getLogger(PatientsPhilHealthController.class);
    private final PatientsPhilHealthService patientsPhilHealthService;

    public PatientsPhilHealthController(PatientsPhilHealthService patientsPhilHealthService) {
        this.patientsPhilHealthService = patientsPhilHealthService;
    }

    @RequestMapping(value="/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getPatientsPhilHealthByAdmissionID(Integer id) {
        List errors = new ArrayList();
        Optional<PatientsPhilHealth> patientsPhilHealth = patientsPhilHealthService.getPatientsPhilHealthByAdmissionID(id);
        if (!patientsPhilHealth.isPresent()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "not_found_error");
            error.put("message", "PatientsPhilHealth not found");
            error.put("target", "model");
            errors.add(error);
            return ResponseEntity.status(404).body(errors);
        }
        return ResponseEntity.ok(patientsPhilHealth);
    }

    @RequestMapping(value="/patient", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addPatientsPhilHealth(PatientsPhilHealth model) {
        List errors = validatePatientsPhilHealth(model.getAdmissionID(), model);
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        Instant now = Instant.now();
        model.setPhilHealthRequestOn(now);
        model.setPhilHealthStatus("Pending");
        PatientsPhilHealth patientsPhilHealth = patientsPhilHealthService.addPatientsPhilHealth(model);
        return ResponseEntity.ok(patientsPhilHealth);
    }

    @PutMapping(value="/patient/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updatePatientsPhilHealth(Integer id, PatientsPhilHealth model) {
        List errors = validatePatientsPhilHealth(id, model);
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        PatientsPhilHealth updatedPatientsPhilHealth = patientsPhilHealthService.updatePatientsPhilHealth(id, model);
        return ResponseEntity.ok(updatedPatientsPhilHealth);
    }

    private List validatePatientsPhilHealth(Integer admissionID, PatientsPhilHealth model) {
        List errors = new ArrayList();
        boolean philHealthForThisPatientExists = patientsPhilHealthService.getPatientsPhilHealthByAdmissionID(admissionID).isPresent();
        if (philHealthForThisPatientExists) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "already_exists_error");
            error.put("message", "PatientsPhilHealth for this patient has been requested");
            error.put("target", "model");
            errors.add(error);
        }
        if(model.getAdmissionID() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "missing_field_error");
            error.put("message", "AdmissionID is required");
            error.put("target", "admissionID");
            errors.add(error);
        }
        if(model.getPhilHealthIDNum() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "missing_field_error");
            error.put("message", "PhilHealthIDNum is required");
            error.put("target", "philHealthIDNum");
            errors.add(error);
        }
        if(model.getPhilHealthSignature() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "missing_field_error");
            error.put("message", "Signature is required");
            error.put("target", "philHealthSignature");
            errors.add(error);
        }
        return errors;
    }
}
