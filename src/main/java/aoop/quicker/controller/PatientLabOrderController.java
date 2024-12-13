package aoop.quicker.controller;

import aoop.quicker.model.PatientBilling;
import aoop.quicker.model.PatientLabOrder;
import aoop.quicker.model.Supply;
import aoop.quicker.model.viewmodel.PatientLabOrderViewModel;
import aoop.quicker.repository.SupplyRepository;
import aoop.quicker.service.PatientBillingService;
import aoop.quicker.service.PatientLabOrderService;
import aoop.quicker.service.SupplyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

/*
    * PatientLabOrderController
    * - to handle the patient lab orders
    * - Springboot REST controller
 */
@RestController
@RequestMapping("/patient-lab-orders")
public class PatientLabOrderController {
    private final Logger log = LoggerFactory.getLogger(PatientLabOrderController.class);
    private final PatientLabOrderService patientLabOrderService;
    private final PatientBillingService patientBillingService;
    private final SupplyService supplyService;

    // Constructor for the PatientLabOrderController
    // - allow dependency injection of the patient lab order service, patient billing service, and supply service
    public PatientLabOrderController(PatientLabOrderService patientLabOrderService, PatientBillingService patientBillingService, SupplyService supplyService) {
        this.patientLabOrderService = patientLabOrderService;
        this.patientBillingService = patientBillingService;
        this.supplyService = supplyService;
    }

    // Handle the request to get all patient lab orders
    @RequestMapping(value = "/all/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<PatientLabOrderViewModel> getPatientLabOrdersOfAdmission(@PathVariable int id, @RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size); // Create a pageable object
        // Get all patient lab orders by admission ID as a page object
        Page<PatientLabOrderViewModel> patientLabOrders = patientLabOrderService.getAllPatientLabOrdersByAdmissionID(id, pageable);
        log.info(patientLabOrders.toString());
        return patientLabOrders;
    }

    // Handle the request to get a patient lab order by ID
    @RequestMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getPatientLabOrder(@PathVariable int id) {
        List errors = new ArrayList();
        // validate if the patient lab order exists
        if (!patientLabOrderService.getPatientLabOrderByID(id).isPresent()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "not_found_error");
            error.put("message", "Patient lab order not found");
            error.put("target", "model");
            errors.add(error);
            return ResponseEntity.status(404).body(errors);
        }
        return ResponseEntity.ok(patientLabOrderService.getPatientLabOrderByID(id).get()); // Return the patient lab order
    }

    // Handle the request to search patient lab orders
    @RequestMapping(value = "/search/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<PatientLabOrderViewModel> searchPatientLabOrders(@PathVariable int id, @RequestParam String query, @RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size); // Create a pageable object
        // Search patient lab orders by query and admission ID as a page object
        Page<PatientLabOrderViewModel> patientLabOrders = patientLabOrderService.searchPatientLabOrders(query, id, pageable);
        log.info(patientLabOrders.toString());
        return patientLabOrders;
    }

    // Handle the request to add a patient lab order
    @PostMapping(value = "/order", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addPatientLabOrder(@RequestBody PatientLabOrder patientLabOrder) {
        List errors = validatePatientLabOrder(patientLabOrder); // Validate the patient lab order
        if (!errors.isEmpty()) { // return any/all errors
            return ResponseEntity.status(400).body(errors);
        }
        Instant now = Instant.now();
        patientLabOrder.setLabOrderedOn(now); // Set the lab ordered on date to now
        patientLabOrder.setLabResultStatus("Pending"); // Initialize the lab result status as pending
        PatientLabOrder response = patientLabOrderService.addPatientLabOrder(patientLabOrder); // Add the patient lab order

        // Add billing
        Supply supply = supplyService.getSupplyById(patientLabOrder.getSupplyID()).get();
        //
        Optional<PatientBilling> existingBilling = patientBillingService.getPatientBillingByAdmissionIDAndDetails(patientLabOrder.getAdmissionID(), supply.getSupplyName());
        PatientBilling billing = new PatientBilling();
        billing.setAdmissionID(patientLabOrder.getAdmissionID());
        billing.setBillingItemDetails(supply.getSupplyName());
        billing.setBillingItemPrice(supply.getSupplyPrice());
        billing.setBillingItemDiscount(new BigDecimal("0.0")); // Set the billing item discount to 0
        // If the billing exists, update the billing item quantity
        if (existingBilling.isPresent()) {
            billing.setBillingItemQty(existingBilling.get().getBillingItemQty() + 1);
            patientBillingService.updatePatientBilling(existingBilling.get().getId(), billing);
        } else {
            // If the billing does not exist, set the billing item quantity to 1
            billing.setBillingItemQty(1);
            patientBillingService.savePatientBilling(billing); // Save the billing
        }

        return ResponseEntity.ok(response);
    }

    // Handle the request to update a patient lab order
    @PutMapping(value = "/order/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updatePatientLabOrder(@PathVariable int id, @RequestBody PatientLabOrder patientLabOrder) {
        List errors = validatePatientLabOrder(patientLabOrder);
        // Validate the patient lab order
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        patientLabOrderService.updatePatientLabOrder(id, patientLabOrder); // Update the patient lab order
        return ResponseEntity.ok(patientLabOrder);
    }

    // Handle the request to delete a patient lab order
    private List validatePatientLabOrder(PatientLabOrder model) {
        List errors = new ArrayList();
        // Validate the patient lab order
        if (model.getAdmissionID() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Admission ID is required");
            error.put("target", "admissionID");
            errors.add(error);
        }
        // Validate the patient lab order
        if (model.getSupplyID() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Supply ID is required");
            error.put("target", "supplyID");
            errors.add(error);
        }

        boolean supplyExists = supplyService.getSupplyById(model.getSupplyID()).isPresent();
        // Validate the patient lab order
        if (!supplyExists) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Supply does not exist");
            error.put("target", "supplyID");
            errors.add(error);
        }
        return errors;
    }
}
