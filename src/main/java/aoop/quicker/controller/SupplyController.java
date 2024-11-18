package aoop.quicker.controller;

import aoop.quicker.model.Supply;
import aoop.quicker.service.SupplyService;
import org.slf4j.Logger;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

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
    public Supply getSupply(@PathVariable int id) {
        return supplyService.getSupplyById(id).get();
    }

    @PostMapping(value="/add", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addSupply(@RequestBody Supply model) {
        // Validations
        ResponseEntity<?> invalidModelResponse = this.validateSupply(model);
        if (invalidModelResponse != null) {
            return invalidModelResponse;
        }
        boolean exists = supplyService.supplyExists(model.getSupplyName());
        if (exists) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("error", "Supply already exists"));
        }

        // to prevent the id from being set
        Supply supply = new Supply();
        supply.setSupplyName(model.getSupplyName());
        supply.setSupplyType(model.getSupplyType());
        supply.setSupplyQty(model.getSupplyQty());
        supply.setSupplyPrice(model.getSupplyPrice());

        return ResponseEntity.ok(supplyService.addSupply(supply));
    }

    @PutMapping(value="/update/{id}", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateSupply(@PathVariable int id, @RequestBody Supply model) {
        ResponseEntity<?> invalidModelResponse = this.validateSupply(model);
        if (invalidModelResponse != null) {
            return invalidModelResponse;
        }
        return ResponseEntity.ok(supplyService.updateSupply(id, model));
    }

    private ResponseEntity<?> validateSupply(Supply model) {
        boolean invalidQty = model.getSupplyQty() < 0;
        boolean invalidPrice = model.getSupplyPrice().compareTo(java.math.BigDecimal.ZERO) < 0;
        String errorMessage = "";
        if (!invalidQty && !invalidPrice) {
            return null;
        }

        if(invalidQty && invalidPrice) {
            errorMessage = "Invalid quantity and price";
        } else if (invalidQty) {
            errorMessage = "Invalid quantity";
        } else if (invalidPrice) {
            errorMessage = "Invalid price";
        }
        return ResponseEntity.badRequest()
                .body(Collections.singletonMap("error", errorMessage));
    }
}
