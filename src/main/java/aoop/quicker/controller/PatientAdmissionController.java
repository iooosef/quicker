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

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

/*
    * PatientAdmissionController
    * - to handle the patient admission of the application
    * - Springboot REST controller
 */
@RestController
@RequestMapping("/patient-admissions")
public class PatientAdmissionController {
    private final Logger log = LoggerFactory.getLogger(PatientAdmissionController.class);
    private final PatientAdmissionService patientAdmissionService;
    private final PatientBillingService patientBillingService;
    private final SupplyService supplyService;
    // Duration for duplicate check threshold
    // aka the time frame to check for duplicate patient admission
    private final Duration DUPLICATE_CHECK_TRERESHOLD = Duration.ofMinutes(90);

    // Constructor for the PatientAdmissionController
    // - allow dependency injection of the patient admission service, patient billing service, and supply service
    public PatientAdmissionController(PatientAdmissionService patientAdmissionService, PatientBillingService patientBillingService, SupplyService supplyService) {
        this.patientAdmissionService = patientAdmissionService;
        this.patientBillingService = patientBillingService;
        this.supplyService = supplyService;
    }

    // Handle the get request for all patient admissions
    @RequestMapping(value="/all", produces= MediaType.APPLICATION_JSON_VALUE)
    public Page<PatientAdmission> getPatientAdmissions(@RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size); // Create a pageable object for pagination controls
        Page<PatientAdmission> patients = patientAdmissionService.getAllPatientAdmissions(pageable); // Get all patient admissions as a page object
        log.info(patients.toString());
        return patients;
    }

    // Handle the search request for patient admissions
    @RequestMapping(value="/search", produces=MediaType.APPLICATION_JSON_VALUE)
    public Page<PatientAdmission> searchPatientAdmissions(@RequestParam String query, @RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size); // Create a pageable object for pagination controls
        // Search for patient admissions based on the query string and get the results as a page object
        Page<PatientAdmission> patients = patientAdmissionService.searchPatientAdmissions(query, pageable); //
        log.info(patients.toString());
        return patients;
    }

    // Handle the get request for a specific patient admission
    @RequestMapping(value="/{id}", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getPatientAdmission(@PathVariable int id) {
        List errors = new ArrayList();
        if (!patientAdmissionService.getPatientAdmissionById(id).isPresent()) {
            // If the patient is not found, return a not found error
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "not_found_error");
            error.put("message", "Patient not found");
            error.put("target", "model");
            errors.add(error);
            return ResponseEntity.status(404).body(errors);
        }
        return ResponseEntity.ok(patientAdmissionService.getPatientAdmissionById(id).get()); // Return the patient admission found
    }

    // Handle the post request to add a new patient admission
    @PostMapping(value="/admission", produces= MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addPatientAdmission(@RequestBody PatientAdmission model) {
        List errors = validatePatientAdmission(model, true);
        // Get first an Optional object of PatientAdmission representing the patient admission of an unoccupied bed
        Optional<PatientAdmission> patientAdmissionUnoccupiedBed = patientAdmissionService.getPatientAdmissionOfUnoccupiedBed(model.getPatientBedLocCode());
        boolean isBedOccupied = patientAdmissionUnoccupiedBed.isPresent(); // Check if the bed location is occupied
        if(isBedOccupied) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Bed location is already occupied");
            error.put("target", "patientBedLocCode");
            errors.add(error);
        }
        if (!errors.isEmpty()) { // return any/all errors
            return ResponseEntity.status(400).body(errors);
        }
        // set the admission date and time to the current date and time
        Instant currentInstant = Instant.now();
        model.setPatientAdmitOn(currentInstant);

        PatientAdmission patient = patientAdmissionService.addPatientAdmission(model); // Add the patient admission

        addBaseERFeeToBilling(patient.getId()); // Add the base emergency room fee to the patient billing of this patient admission

        return ResponseEntity.ok(patient);
    }

    // Handle the post request to add a new patient admission with force parameter
    // ignores
    @PostMapping(value="/admission/force", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addPatientAdmissionForce(@RequestBody PatientAdmission model, @RequestParam boolean force) {
        // Validate the patient admission model
        // don't check for duplicate patient admission
        List errors = validatePatientAdmission(model, false);
        if (!force) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Force parameter is false");
            error.put("target", "force");
            errors.add(error);
        }
        Optional<PatientAdmission> patientAdmissionUnoccupiedBed = patientAdmissionService.getPatientAdmissionOfUnoccupiedBed(model.getPatientBedLocCode());
        boolean isBedOccupied = patientAdmissionUnoccupiedBed.isPresent();
        if(isBedOccupied) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Bed location is already occupied");
            error.put("target", "patientBedLocCode");
            errors.add(error);
        }
        if (!errors.isEmpty()) { // return any/all errors
            return ResponseEntity.status(400).body(errors);
        }
        // set the admission date and time to the current date and time
        Instant currentInstant = Instant.now();
        model.setPatientAdmitOn(currentInstant);
        PatientAdmission patient = patientAdmissionService.addPatientAdmission(model); // Add the patient admission
        // Add the base emergency room fee to the patient billing of this patient admission
        addBaseERFeeToBilling(patient.getId());

        return ResponseEntity.ok(patient);
    }

    // Handle the put request to update a patient admission
    @PutMapping(value="/admission/{id}", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updatePatientAdmission(@PathVariable int id, @RequestBody PatientAdmission model) {
        // Validate the patient admission model
        // don't check for duplicate patient admission
        List errors = validatePatientAdmission(model, false);
        // Check if the patient admission is found
        if (!patientAdmissionService.getPatientAdmissionById(id).isPresent()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "not_found_error");
            error.put("message", "Patient not found");
            error.put("target", "model");
            errors.add(error);
        }
        // Check if the bed location is alreadu occupied

        // Get the original bed location code of the patient admission
        String originalBedLocCode = patientAdmissionService.getPatientAdmissionById(id).get().getPatientBedLocCode();
        // Check if the bed location is changed
        boolean isBedLocationChanged = !originalBedLocCode.equals(model.getPatientBedLocCode());
        // Get first an Optional object of PatientAdmission representing the patient admission of an unoccupied bed
        Optional<PatientAdmission> patientAdmissionUnoccupiedBed = patientAdmissionService.getPatientAdmissionOfUnoccupiedBed(model.getPatientBedLocCode());
        // Check if the bed location is occupied
        boolean isBedOccupied = patientAdmissionUnoccupiedBed.isPresent();
        if(isBedLocationChanged && isBedOccupied) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Bed location is already occupied");
            error.put("target", "patientBedLocCode");
            errors.add(error);
        }
        if (!errors.isEmpty()) { // return any/all errors
            return ResponseEntity.status(400).body(errors);
        }
        // set the admission date and time to the original date and time
        var addedOn = patientAdmissionService.getPatientAdmissionById(id).get().getPatientAdmitOn();
        model.setPatientAdmitOn(addedOn);

        PatientAdmission patient = patientAdmissionService.updatePatientAdmission(id, model); // Update the patient admission
        return ResponseEntity.ok(patient);
    }

    // Handle the put request to update the patient ID of a patient admission
    @PutMapping(value="/admission/patientID/{id}", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> setAdmissionPatientID(@PathVariable int id, @RequestBody PatientAdmission model) {
        List errors = new ArrayList();
        // Check if the patient ID is valid
        if (model.getPatientID() == null || model.getPatientID() <= 0) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Patient ID is required");
            error.put("target", "patientID");
            errors.add(error);
        }
        // Check if the patient admission is found
        Optional<PatientAdmission> ogPatient = patientAdmissionService.getPatientAdmissionById(id);
        if (!ogPatient.isPresent()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "not_found_error");
            error.put("message", "Patient not found");
            error.put("target", "model");
            errors.add(error);
        }
        if (!errors.isEmpty()) { // return any/all errors
            return ResponseEntity.status(400).body(errors);
        }
        // Update the patient ID of the patient admission
        ogPatient.get().setPatientID(model.getPatientID());
        PatientAdmission updatedPatient = patientAdmissionService.updatePatientAdmission(id, ogPatient.get());
        return ResponseEntity.ok(updatedPatient);
    }

    // function to add the base emergency room fee to the patient billing of a patient admissions
    private void addBaseERFeeToBilling(int admissionID) {
        // Get the base emergency room fee supply
        Supply baseERFee = supplyService.getSupplyByNameAndType("Emergency Room Fee", "base_fee").get();
        // Create a new patient billing object
        PatientBilling patientBilling = new PatientBilling();
        patientBilling.setAdmissionID(admissionID); // Set the admission ID of the patient billing
        patientBilling.setBillingItemDetails(baseERFee.getSupplyName()); // Set the billing item details of the patient billing
        patientBilling.setBillingItemPrice(baseERFee.getSupplyPrice()); // Set the billing item price of the patient billing
        patientBilling.setBillingItemQty(1); // Set the billing item quantity of the patient billing, initialize as 1
        patientBilling.setBillingItemDiscount(new BigDecimal("0.0")); // Set the billing item discount of the patient billing, initialize as 0
        patientBillingService.savePatientBilling(patientBilling); // Save the patient billing
    }

    // function to validate the patient admission model
    private List validatePatientAdmission(PatientAdmission model, boolean checkDuplicate) {
        List errors = new ArrayList();
        // validate if the patient name is empty or null
        if (model.getPatientName() == null || model.getPatientName().isEmpty()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Patient name is required. If unknown, use descriptive name");
            error.put("target", "patientName");
            errors.add(error);
        }
        // validate if the patient triage is empty or null
        if (model.getPatientTriage() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Patient triage is required");
            error.put("target", "patientTriage");
            errors.add(error);
        }
        // validate if the patient status is empty or null
        if (model.getPatientStatus() == null || model.getPatientStatus().isEmpty()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Patient status is required");
            error.put("target", "patientStatus");
            errors.add(error);
        }
        // validate if the patient billing status is empty or null
        if (model.getPatientStatus() == null || model.getPatientStatus().isEmpty()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Patient billing status is required");
            error.put("target", "patientBillingStatus");
            errors.add(error);
        }
        // constrain the patient billing status to only three values
        if (!(model.getPatientBillingStatus().equals("unpaid") ||
                model.getPatientBillingStatus().equals("paid") ||
                model.getPatientBillingStatus().equals("collateralized"))) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Patient billing status is invalid");
            error.put("target", "patientBillingStatus");
            errors.add(error);
        }
        // validate if the patient bed location code is empty or null
        if (model.getPatientBedLocCode() == null || model.getPatientBedLocCode().isEmpty()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Patient bed location code is required");
            error.put("target", "patientBedLocCode");
            errors.add(error);
        }
        // validate if the patient emergency reason is null
        if (model.getPatientERCause() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Patient's emergency reason is required");
            error.put("target", "patientERCause");
            errors.add(error);
        }
        if (checkDuplicate) { // only validate if checkDuplicate is true
            // check if the patient admission is added in the last time threshold
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
