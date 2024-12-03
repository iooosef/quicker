package aoop.quicker.controller;

import aoop.quicker.model.PatientBilling;
import aoop.quicker.model.PatientTreatmentOrder;
import aoop.quicker.model.Supply;
import aoop.quicker.model.viewmodel.PatientTreatmentOrderViewModel;
import aoop.quicker.repository.PatientTreatmentOrderRepository;
import aoop.quicker.repository.SupplyRepository;
import aoop.quicker.service.PatientBillingService;
import aoop.quicker.service.PatientTreatmentOrderService;
import aoop.quicker.service.SupplyService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/patient-treatment-orders")
public class PatientTreatmentOrderController {
    private final Logger log = LoggerFactory.getLogger(PatientTreatmentOrderController.class);
    private final PatientTreatmentOrderService patientTreatmentOrderService;
    private final SupplyService supplyService;
    private final PatientBillingService patientBillingService;

    public PatientTreatmentOrderController(PatientTreatmentOrderService patientTreatmentOrderService, SupplyService supplyService, PatientBillingService patientBillingService) {
        this.patientTreatmentOrderService = patientTreatmentOrderService;
        this.supplyService = supplyService;
        this.patientBillingService = patientBillingService;
    }

    @RequestMapping(value = "/all/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<PatientTreatmentOrderViewModel> getPatientTreatmentOrdersOfAdmission(@PathVariable int id, @RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PatientTreatmentOrderViewModel> patientTreatmentOrders = patientTreatmentOrderService.getAllPatientTreatmentOrdersByAdmissionID(id, pageable);
        log.info(patientTreatmentOrders.toString());
        return patientTreatmentOrders;
    }

    @RequestMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getPatientTreatmentOrder(@PathVariable int id) {
        List errors = new ArrayList();
        if (!patientTreatmentOrderService.getPatientTreatmentOrderByID(id).isPresent()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "not_found_error");
            error.put("message", "Patient treatment order not found");
            error.put("target", "model");
            errors.add(error);
            return ResponseEntity.status(404).body(errors);
        }
        return ResponseEntity.ok(patientTreatmentOrderService.getPatientTreatmentOrderByID(id).get());
    }

    @RequestMapping(value = "/search/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<PatientTreatmentOrderViewModel> searchPatientTreatmentOrders(@PathVariable int id, @RequestParam String query, @RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PatientTreatmentOrderViewModel> patientTreatmentOrders = patientTreatmentOrderService.searchPatientTreatmentOrders(query, id, pageable);
        log.info(patientTreatmentOrders.toString());
        return patientTreatmentOrders;
    }

    @PostMapping(value = "/order", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addPatientTreatmentOrder(@RequestBody PatientTreatmentOrder patientTreatmentOrder) {
        List errors = validatePatientTreatmentOrder(patientTreatmentOrder);
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        Instant now = Instant.now();
        patientTreatmentOrder.setTreatmentOrderedOn(now);
        PatientTreatmentOrder response = patientTreatmentOrderService.addPatientTreatmentOrder(patientTreatmentOrder);

        // Add Billing
        Supply supply = supplyService.getSupplyById(patientTreatmentOrder.getSupplyID()).get();
        Optional<PatientBilling> existingBilling = patientBillingService.getPatientBillingByAdmissionIDAndDetails(patientTreatmentOrder.getAdmissionID(), supply.getSupplyName());
        PatientBilling billing = new PatientBilling();
        billing.setAdmissionID(patientTreatmentOrder.getAdmissionID());
        billing.setBillingItemDetails(supply.getSupplyName());
        billing.setBillingItemPrice(supply.getSupplyPrice());

        if (existingBilling.isPresent()) {
            billing.setBillingItemQty(existingBilling.get().getBillingItemQty() + 1);
            patientBillingService.updatePatientBilling(existingBilling.get().getId(), billing);
        } else {
            billing.setBillingItemQty(1);
            patientBillingService.savePatientBilling(billing);
        }

        return ResponseEntity.ok(response);
    }

    @PutMapping(value = "/order/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updatePatientTreatmentOrder(@PathVariable int id, @RequestBody PatientTreatmentOrder patientTreatmentOrder) {
        List errors = validatePatientTreatmentOrder(patientTreatmentOrder);
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        return ResponseEntity.ok(patientTreatmentOrderService.updatePatientTreatmentOrder(id, patientTreatmentOrder));
    }

    private List validatePatientTreatmentOrder(PatientTreatmentOrder patientTreatmentOrder) {
        List errors = new ArrayList();
        if (patientTreatmentOrder.getAdmissionID() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "missing_field_error");
            error.put("message", "Admission ID is required");
            error.put("target", "model");
            errors.add(error);
        }
        if (patientTreatmentOrder.getSupplyID() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "missing_field_error");
            error.put("message", "Supply ID is required");
            error.put("target", "model");
            errors.add(error);
        }
        if (patientTreatmentOrder.getTreatmentOrderedOn() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "missing_field_error");
            error.put("message", "Treatment ordered on is required");
            error.put("target", "model");
            errors.add(error);
        }
        return errors;
    }

}
