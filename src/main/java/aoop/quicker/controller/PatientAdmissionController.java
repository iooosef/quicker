package aoop.quicker.controller;

import aoop.quicker.model.PatientAdmission;
import aoop.quicker.model.PatientBilling;
import aoop.quicker.model.Supply;
import aoop.quicker.service.PatientAdmissionService;
import aoop.quicker.service.PatientBillingService;
import aoop.quicker.service.SupplyService;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/patient-admissions")
public class PatientAdmissionController {
    private final Logger log = LoggerFactory.getLogger(PatientAdmissionController.class);
    private final PatientAdmissionService patientAdmissionService;
    private final PatientBillingService patientBillingService;
    private final SupplyService supplyService;
    private final Duration DUPLICATE_CHECK_TRERESHOLD = Duration.ofMinutes(90);

    public PatientAdmissionController(PatientAdmissionService patientAdmissionService, PatientBillingService patientBillingService, SupplyService supplyService) {
        this.patientAdmissionService = patientAdmissionService;
        this.patientBillingService = patientBillingService;
        this.supplyService = supplyService;
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

    @PostMapping(value="/admission", produces= MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addPatientAdmission(@RequestBody PatientAdmission model) {
        List errors = validatePatientAdmission(model, true);
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        Instant currentInstant = Instant.now();
        model.setPatientAdmitOn(currentInstant);
        PatientAdmission patient = patientAdmissionService.addPatientAdmission(model);

        addBaseERFeeToBilling(patient.getId());

        return ResponseEntity.ok(patient);
    }

    @PostMapping(value="/admission/force", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addPatientAdmissionForce(@RequestBody PatientAdmission model, @RequestParam boolean force) {
        List errors = validatePatientAdmission(model, true);
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
        Instant currentInstant = Instant.now();
        model.setPatientAdmitOn(currentInstant);
        PatientAdmission patient = patientAdmissionService.addPatientAdmission(model);

        addBaseERFeeToBilling(patient.getId());

        return ResponseEntity.ok(patient);
    }

    @PutMapping(value="/admission/{id}", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updatePatientAdmission(@PathVariable int id, @RequestBody PatientAdmission model) {
        List errors = validatePatientAdmission(model, false);
        if (!patientAdmissionService.getPatientAdmissionById(id).isPresent()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "not_found_error");
            error.put("message", "Patient not found");
            error.put("target", "model");
            errors.add(error);
        }
        String originalBedLocCode = patientAdmissionService.getPatientAdmissionById(id).get().getPatientBedLocCode();
        boolean isBedLocationChanged = !originalBedLocCode.equals(model.getPatientBedLocCode());
        Optional<PatientAdmission> patientAdmissionUnoccupiedBed = patientAdmissionService.getPatientAdmissionOfUnoccupiedBed(model.getPatientBedLocCode());
        boolean isBedOccupied = patientAdmissionUnoccupiedBed.isPresent();
        if(isBedLocationChanged && isBedOccupied) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Bed location is already occupied");
            error.put("target", "patientBedLocCode");
            errors.add(error);
        }
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        var addedOn = patientAdmissionService.getPatientAdmissionById(id).get().getPatientAdmitOn();
        model.setPatientAdmitOn(addedOn);
        PatientAdmission patient = patientAdmissionService.updatePatientAdmission(id, model);
        return ResponseEntity.ok(patient);
    }

    @PutMapping(value="/admission/patientID/{id}", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> setAdmissionPatientID(@PathVariable int id, @RequestBody PatientAdmission model) {
        List errors = new ArrayList();
        if (model.getPatientID() == null || model.getPatientID() <= 0) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Patient ID is required");
            error.put("target", "patientID");
            errors.add(error);
        }
        Optional<PatientAdmission> ogPatient = patientAdmissionService.getPatientAdmissionById(id);
        if (!ogPatient.isPresent()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "not_found_error");
            error.put("message", "Patient not found");
            error.put("target", "model");
            errors.add(error);
        }
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        ogPatient.get().setPatientID(model.getPatientID());
        PatientAdmission updatedPatient = patientAdmissionService.updatePatientAdmission(id, ogPatient.get());
        return ResponseEntity.ok(updatedPatient);
    }

    private void addBaseERFeeToBilling(int admissionID) {
        Supply baseERFee = supplyService.getSupplyByNameAndType("Emergency Room Fee", "base_fee").get();
        PatientBilling patientBilling = new PatientBilling();
        patientBilling.setAdmissionID(admissionID);
        patientBilling.setBillingItemDetails(baseERFee.getSupplyName());
        patientBilling.setBillingItemPrice(baseERFee.getSupplyPrice());
        patientBillingService.savePatientBilling(patientBilling);
    }

    private List validatePatientAdmission(PatientAdmission model, boolean isAdd) {
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
        if (model.getPatientERCause() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Patient's emergency reason is required");
            error.put("target", "patientERCause");
            errors.add(error);
        }
        if (isAdd) {
            boolean isNewPatientDuplicate = patientAdmissionService.isPatientAdmissionAddedInTheLast(model.getPatientName(), model.getPatientERCause(), DUPLICATE_CHECK_TRERESHOLD);
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
