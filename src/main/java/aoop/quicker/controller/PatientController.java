package aoop.quicker.controller;

import aoop.quicker.model.Patient;
import aoop.quicker.service.PatientService;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/patients")
public class PatientController {
    private final Logger log = LoggerFactory.getLogger(PatientController.class);
    private final PatientService patientService;
    private final Duration DUPLICATE_CHECK_TRERESHOLD = Duration.ofMinutes(90);

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping(value="/add", produces= MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addPatient(@RequestBody Patient model) {
        List errors = validatePatient(model, true);
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        Patient patient = patientService.addPatient(model);
        return ResponseEntity.ok(patient);
    }

    private List validatePatient(Patient model, boolean isAdd) {
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
            boolean isNewPatientDuplicate = patientService.isPatientAddedInTheLast(model.getPatientName(), DUPLICATE_CHECK_TRERESHOLD);
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
