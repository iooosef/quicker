package aoop.quicker.controller;

import aoop.quicker.model.PatientsHMO;
import aoop.quicker.service.PatientsHMOService;
import org.apache.coyote.Response;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.servlet.View;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

/* PatientsHMOController
 * - to handle the patient HMO operations
 * - Spring Boot REST controller
 */
@RestController
@RequestMapping("/patients-hmo")
public class PatientsHMOController {
    private final Logger log = LoggerFactory.getLogger(PatientsHMOController.class);
    private final PatientsHMOService patientsHMOService;

    // Constructor for the PatientsHMOController
    // - allow dependency injection of the patients HMO service
    public PatientsHMOController(PatientsHMOService patientsHMOService, View error) {
        this.patientsHMOService = patientsHMOService;
    }

    // Handle the request to get the patient HMO by admission ID
    @RequestMapping(value="/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getPatientsHMOByAdmissionID(@PathVariable Integer id) {
        List errors = new ArrayList();
        // validate the admission ID
        Optional<PatientsHMO> patientsHMO = patientsHMOService.getPatientsHMOByAdmissionID(id);
        if (!patientsHMO.isPresent()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "not_found_error");
            error.put("message", "PatientsHMO not found");
            error.put("target", "model");
            errors.add(error);
            return ResponseEntity.status(404).body(errors);
        }
        return ResponseEntity.ok(patientsHMO.get());
    }

    // Handle the request to add the patient HMO
    @PostMapping(value="/patient", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addPatientsHMO(@RequestBody PatientsHMO model) {
        List errors = validatePatientsHMO(model.getAdmissionID(), model); // validate the patient HMO
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        // set the request date and status
        Instant now = Instant.now();
        model.sethMORequestOn(now);
        model.sethMOStatus("Pending");
        PatientsHMO patientsHMO = patientsHMOService.addPatientsHMO(model); // add the patient HMO
        return ResponseEntity.ok(patientsHMO);
    }

    // Handle the request to update the patient HMO by admission ID
    @PutMapping(value="/patient/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateHMOByAdmissionID(@PathVariable Integer id, @RequestBody PatientsHMO model) {
        List errors = validatePatientsHMO(id, model); // validate the patient HMO
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        // update the patient HMO
        PatientsHMO updatedPatientsHMO = patientsHMOService.updatePatientsHMO(id, model);
        return ResponseEntity.ok(updatedPatientsHMO);
    }

    // Helper method to validate the patient HMO
    private List validatePatientsHMO(Integer admissionID, PatientsHMO model) {
        List errors = new ArrayList();
        // check if the HMO for this patient exists
        boolean hmoForThisPatientExists = patientsHMOService.getPatientsHMOByAdmissionID(admissionID).isPresent();
        if (hmoForThisPatientExists) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "HMO has already been requested for this patient");
            error.put("target", "model");
            errors.add(error);
        }

        // check if the required fields are provided
        if (model.getAdmissionID() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Admission ID is required");
            error.put("target", "admissionID");
            errors.add(error);
        }
        if (model.gethMOIDNum() == null || model.gethMOIDNum().trim().isEmpty()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "HMO ID Number is required");
            error.put("target", "HMOIDNum");
            errors.add(error);
        }
        if (model.gethMOSignature() == null || model.gethMOSignature().length == 0) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Signature is required");
            error.put("target", "hMOSignature");
            errors.add(error);
        }
        return errors;
    }

}
