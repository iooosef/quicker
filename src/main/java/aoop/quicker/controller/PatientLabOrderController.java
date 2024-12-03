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

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/patient-lab-orders")
public class PatientLabOrderController {
    private final Logger log = LoggerFactory.getLogger(PatientLabOrderController.class);
    private final PatientLabOrderService patientLabOrderService;
    private final PatientBillingService patientBillingService;
    private final SupplyService supplyService;

    public PatientLabOrderController(PatientLabOrderService patientLabOrderService, PatientBillingService patientBillingService, SupplyService supplyService) {
        this.patientLabOrderService = patientLabOrderService;
        this.patientBillingService = patientBillingService;
        this.supplyService = supplyService;
    }

    @RequestMapping(value = "/all/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<PatientLabOrderViewModel> getPatientLabOrdersOfAdmission(@PathVariable int id, @RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PatientLabOrderViewModel> patientLabOrders = patientLabOrderService.getAllPatientLabOrdersByAdmissionID(id, pageable);
        log.info(patientLabOrders.toString());
        return patientLabOrders;
    }

    @RequestMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getPatientLabOrder(@PathVariable int id) {
        List errors = new ArrayList();
        if (!patientLabOrderService.getPatientLabOrderByID(id).isPresent()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "not_found_error");
            error.put("message", "Patient lab order not found");
            error.put("target", "model");
            errors.add(error);
            return ResponseEntity.status(404).body(errors);
        }
        return ResponseEntity.ok(patientLabOrderService.getPatientLabOrderByID(id).get());
    }

    @RequestMapping(value = "/search/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<PatientLabOrderViewModel> searchPatientLabOrders(@PathVariable int id, @RequestParam String query, @RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PatientLabOrderViewModel> patientLabOrders = patientLabOrderService.searchPatientLabOrders(query, id, pageable);
        log.info(patientLabOrders.toString());
        return patientLabOrders;
    }

    @PostMapping(value = "/order", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addPatientLabOrder(@RequestBody PatientLabOrder patientLabOrder) {
        List errors = validatePatientLabOrder(patientLabOrder);
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        Instant now = Instant.now();
        patientLabOrder.setLabOrderedOn(now);
        patientLabOrder.setLabResultStatus("Pending");
        PatientLabOrder response = patientLabOrderService.addPatientLabOrder(patientLabOrder);

        // Add billing
        Supply supply = supplyService.getSupplyById(patientLabOrder.getSupplyID()).get();
        Optional<PatientBilling> existingBilling = patientBillingService.getPatientBillingByAdmissionIDAndDetails(patientLabOrder.getAdmissionID(), supply.getSupplyName());
        PatientBilling billing = new PatientBilling();
        billing.setAdmissionID(patientLabOrder.getAdmissionID());
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
    public ResponseEntity<?> updatePatientLabOrder(@PathVariable int id, @RequestBody PatientLabOrder patientLabOrder) {
        List errors = validatePatientLabOrder(patientLabOrder);
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        patientLabOrderService.updatePatientLabOrder(id, patientLabOrder);
        return ResponseEntity.ok(patientLabOrder);
    }

    private List validatePatientLabOrder(PatientLabOrder model) {
        List errors = new ArrayList();
        if (model.getAdmissionID() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Admission ID is required");
            error.put("target", "admissionID");
            errors.add(error);
        }
        if (model.getSupplyID() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Supply ID is required");
            error.put("target", "supplyID");
            errors.add(error);
        }

        boolean supplyExists = supplyService.getSupplyById(model.getSupplyID()).isPresent();
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
