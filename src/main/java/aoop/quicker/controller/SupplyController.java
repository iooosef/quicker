package aoop.quicker.controller;

import aoop.quicker.model.Supply;
import aoop.quicker.service.SupplyService;
import org.slf4j.Logger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/supplies")
public class SupplyController {
    private final Logger log = org.slf4j.LoggerFactory.getLogger(SupplyController.class);
    private final SupplyService supplyService;

    public SupplyController(SupplyService supplyService) {
        this.supplyService = supplyService;
    }

    @RequestMapping(value="/all", produces= MediaType.APPLICATION_JSON_VALUE)
    public Page<Supply> getSupplies(@RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Supply> supplies = supplyService.getAllSupplies(pageable);
        log.info(supplies.toString());
        return supplies;
    }

    @RequestMapping(value="/search", produces=MediaType.APPLICATION_JSON_VALUE)
    public Page<Supply> searchSupplies(@RequestParam String query, @RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Supply> supplies = supplyService.searchSupplies(query, pageable);
        log.info(supplies.toString());
        return supplies;
    }

    @RequestMapping(value="/{id}", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getSupply(@PathVariable int id) {
        List errors = new ArrayList();
        if (!supplyService.getSupplyById(id).isPresent()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "not_found_error");
            error.put("message", "Supply not found");
            error.put("target", "model");
            errors.add(error);
            return ResponseEntity.status(404).body(errors);
        }
        return ResponseEntity.ok(supplyService.getSupplyById(id).get());
    }

    @PostMapping(value="/supply", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addSupply(@RequestBody Supply model) {
        List errors = new ArrayList();
        // Validations
        var invalidModelResponse = this.validateSupply(model);
        if (!invalidModelResponse.isEmpty()) {
            errors.addAll(invalidModelResponse);
        }
        boolean exists = supplyService.supplyExists(model.getSupplyName(), model.getSupplyType());
        if (exists) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Supply already exists");
            error.put("target", "model");
        }
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }

        // to prevent the id from being set
        Supply supply = new Supply();
        supply.setSupplyName(model.getSupplyName());
        supply.setSupplyType(model.getSupplyType());
        supply.setSupplyQty(model.getSupplyQty());
        supply.setSupplyPrice(model.getSupplyPrice());

        return ResponseEntity.ok(supplyService.addSupply(supply));
    }

    @PutMapping(value="/supply/{id}", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateSupply(@PathVariable int id, @RequestBody Supply model) {
        List errors = new ArrayList();
        var invalidModelResponse = this.validateSupply(model);
        if (!invalidModelResponse.isEmpty()) {
            errors.addAll(invalidModelResponse);
        }
        if (!supplyService.getSupplyById(id).isPresent()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "not_found_error");
            error.put("message", "Supply not found");
            error.put("target", "model");
            errors.add(error);
        }
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }

        return ResponseEntity.ok(supplyService.updateSupply(id, model));
    }

    private List validateSupply(Supply model) {
        List errors = new ArrayList();
        if (model.getSupplyName() == null || model.getSupplyName().isEmpty()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Supply name is required");
            error.put("target", "model");
            errors.add(error);
        }
        if (model.getSupplyType() == null || model.getSupplyType().isEmpty()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Supply type is required");
            error.put("target", "model");
            errors.add(error);
        }
        if (model.getSupplyQty() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Supply quantity is required");
            error.put("target", "model");
            errors.add(error);
        }
        if (model.getSupplyPrice() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Supply price is required");
            error.put("target", "model");
            errors.add(error);
        }
        boolean isSupply = model.getSupplyType().contains("supply:");

        boolean invalidQty = model.getSupplyQty() < 0;
        if (isSupply && invalidQty) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Invalid quantity");
            error.put("target", "model");
            errors.add(error);
        }
        if (!isSupply && model.getSupplyQty() != -1) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Invalid quantity");
            error.put("target", "model");
            errors.add(error);
        }

        boolean invalidPrice = model.getSupplyPrice().compareTo(java.math.BigDecimal.ZERO) <= 0;
        if (invalidPrice) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Invalid price");
            error.put("target", "model");
            errors.add(error);
        }
        return errors;
    }
}
