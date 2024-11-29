package aoop.quicker.controller;

import aoop.quicker.model.PatientTreatmentOrder;
import aoop.quicker.model.viewmodel.PatientTreatmentOrderViewModel;
import aoop.quicker.repository.SupplyRepository;
import aoop.quicker.service.PatientTreatmentOrderService;
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

@RestController
@RequestMapping("/patient-treatment-orders")
public class PatientTreatmentOrderController {
    private final Logger log = LoggerFactory.getLogger(PatientTreatmentOrderController.class);
    private final PatientTreatmentOrderService patientTreatmentOrderService;
    private final SupplyRepository supplyRepository;

    public PatientTreatmentOrderController(PatientTreatmentOrderService patientTreatmentOrderService, SupplyRepository supplyRepository) {
        this.patientTreatmentOrderService = patientTreatmentOrderService;
        this.supplyRepository = supplyRepository;
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
        return ResponseEntity.ok(patientTreatmentOrderService.addPatientTreatmentOrder(patientTreatmentOrder));
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
