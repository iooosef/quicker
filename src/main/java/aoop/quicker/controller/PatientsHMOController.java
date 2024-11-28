package aoop.quicker.controller;

import aoop.quicker.model.PatientsHMO;
import aoop.quicker.service.PatientsHMOService;
import org.apache.coyote.Response;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.servlet.View;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/patients-hmo")
public class PatientsHMOController {
    private final Logger log = LoggerFactory.getLogger(PatientsHMOController.class);
    private final PatientsHMOService patientsHMOService;
    private final View error;

    public PatientsHMOController(PatientsHMOService patientsHMOService, View error) {
        this.patientsHMOService = patientsHMOService;
        this.error = error;
    }

    @RequestMapping(value="/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getPatientsHMOByAdmissionID(Integer id) {
        List errors = new ArrayList();
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

    @RequestMapping(value="/hmo", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addPatientsHMO(@RequestBody PatientsHMO model) {
        List errors = validatePatientsHMO(model.getAdmissionID(), model);
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        model.setHMOStatus("Pending");
        PatientsHMO patientsHMO = patientsHMOService.addPatientsHMO(model);
        return ResponseEntity.ok(patientsHMO);
    }

    @PutMapping(value="/hmo/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateHMOByAdmissionID(Integer id, @RequestBody PatientsHMO model) {
        List errors = validatePatientsHMO(id, model);
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        PatientsHMO updatedPatientsHMO = patientsHMOService.updatePatientsHMO(id, model);
        return ResponseEntity.ok(updatedPatientsHMO);
    }

    private List validatePatientsHMO(Integer admissionID, PatientsHMO model) {
        List errors = new ArrayList();
        boolean hmoForThisPatientExists = patientsHMOService.getPatientsHMOByAdmissionID(admissionID).isPresent();
        if (hmoForThisPatientExists) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "HMO has already been requested for this patient");
            error.put("target", "model");
            errors.add(error);
        }
        if (model.getAdmissionID() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Admission ID is required");
            error.put("target", "admissionID");
            errors.add(error);
        }
        if (model.getHMOIDNum() == null || model.getHMOIDNum() == "") {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "HMO ID Number is required");
            error.put("target", "HMOIDNum");
            errors.add(error);
        }
        if (model.getHMOEmployer() == null || model.getHMOEmployer() == "") {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Employer is required");
            error.put("target", "HMOEmployer");
            errors.add(error);
        }
        if (model.getHMOSignature() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Signature is required");
            error.put("target", "hMOSignature");
            errors.add(error);
        }
        return errors;
    }

}
