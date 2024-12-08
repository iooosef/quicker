package aoop.quicker.controller;

import aoop.quicker.model.Bed;
import aoop.quicker.service.BedService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/beds")
public class BedController {
    private final Logger log = LoggerFactory.getLogger(BedController.class);
    private final BedService bedService;

    public BedController(BedService bedService) {
        this.bedService = bedService;
    }

    @RequestMapping(value = "/all", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<Bed> getBeds(@RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Bed> beds = bedService.getAllBeds(pageable);
        log.info(beds.toString());
        return beds;
    }

    @RequestMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<Bed> searchBeds(@RequestParam String query, @RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Bed> beds = bedService.searchBeds(query, pageable);
        log.info(beds.toString());
        return beds;
    }

    @RequestMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getBed(@PathVariable int id) {
        List errors = Collections.emptyList();
        if (!bedService.getBedById(id).isPresent()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "not_found_error");
            error.put("message", "Bed not found");
            error.put("target", "model");
            errors.add(error);
            return ResponseEntity.status(404).body(errors);
        }
        return ResponseEntity.ok(bedService.getBedById(id).get());
    }

    @PostMapping(value = "/bed", produces = MediaType.APPLICATION_JSON_VALUE)
    public Bed addBed() {
        // Default location at 000 and status of inactive
        // New beds are stored in the storage first before being assigned to a location
        Bed model = new Bed();

        model.setBedLocCode("LOC000");
        model.setBedStatus("Inactive");
        return bedService.addBed(model);
    }

    @PutMapping(value = "/bed/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateBed(@PathVariable int id, @RequestBody Bed model) {
        List errors = new ArrayList();
        // Validation to prevent having two or more available beds in the same location
        boolean isNewStatusAvailable = model.getBedStatus().equals("available");
        boolean isAvailable = bedService.isAlreadyAvailable(model.getBedLocCode());
        if (isNewStatusAvailable && isAvailable) {
            // If the new status is available and the location code is available
            // then return a bad request
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "This location already has a bed.");
            error.put("target", "model");
            errors.add(error);
            return ResponseEntity.badRequest().body(errors);
        }

        // Validation to prevent changing of status of already disposed beds
        boolean isDisposed = bedService.getBedById(id).get().getBedStatus().equals("disposed");
        boolean isNewStatusDisposed = model.getBedStatus().equals("disposed");
        if (isDisposed && !isNewStatusDisposed) {
            HashMap<String, String> error = new HashMap<>();
            // If the bed is already disposed and the new status is not disposed
            // then return a bad request
            error.put("type", "validation_error");
            error.put("message", "This bed is already disposed.");
            error.put("target", "model");
            errors.add(error);
            return ResponseEntity.badRequest().body(errors);
        }

        model.setId(id);
        return ResponseEntity.ok(bedService.updateBed(id, model));
    }
}
