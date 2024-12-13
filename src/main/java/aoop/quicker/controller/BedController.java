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

/**
 * BedController
 * - This class is a controller class that handles the HTTP requests for the Bed model.
 * - It is responsible for handling the CRUD operations for the Bed model.
 */
@RestController
@RequestMapping("/beds")
public class BedController {
    private final Logger log = LoggerFactory.getLogger(BedController.class);
    private final BedService bedService;

    // Constructor for the BedController
    // - allow dependency injection of the bed service
    public BedController(BedService bedService) {
        this.bedService = bedService;
    }

    // Handle the get request for all beds
    @RequestMapping(value = "/all", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<Bed> getBeds(@RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size); // Create a pageable object for pagination controls
        Page<Bed> beds = bedService.getAllBeds(pageable); // Get all beds from the bed service as Page object
        log.info(beds.toString());
        return beds;
    }

    // Handle the search request for beds
    @RequestMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<Bed> searchBeds(@RequestParam String query, @RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size); // Create a pageable object for pagination controls
        Page<Bed> beds = bedService.searchBeds(query, pageable); // Search for beds from the bed service as Page object
        log.info(beds.toString());
        return beds;
    }

    // Handle the get request for a specific bed
    @RequestMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getBed(@PathVariable int id) {
        List errors = Collections.emptyList();
        if (!bedService.getBedById(id).isPresent()) {
            // If the bed is not found, return a not found error
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "not_found_error");
            error.put("message", "Bed not found");
            error.put("target", "model");
            errors.add(error);
            return ResponseEntity.status(404).body(errors);
        }
        return ResponseEntity.ok(bedService.getBedById(id).get()); // Return the bed if found
    }

    // Handle the post request to add a new bed
    @PostMapping(value = "/bed", produces = MediaType.APPLICATION_JSON_VALUE)
    public Bed addBed() {
        // Default location at 000 and status of inactive
        // as new beds are stored in the storage first before being assigned to a location
        Bed model = new Bed();

        model.setBedLocCode("LOC000");
        model.setBedStatus("Inactive");
        return bedService.addBed(model); // Return the newly added bed
    }

    // Handle the put request to update a bed
    @PutMapping(value = "/bed/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateBed(@PathVariable int id, @RequestBody Bed model) {
        List errors = new ArrayList();
        // Validation to prevent having two or more available beds in the same location
        boolean isNewStatusAvailable = model.getBedStatus().equals("available");
        // Check if the location code is already available
        boolean isAvailable = bedService.isAlreadyAvailable(model.getBedLocCode());

        // If the new status is available and the location code is available
        // then return a bad request
        if (isNewStatusAvailable && isAvailable) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "This location already has a bed.");
            error.put("target", "model");
            errors.add(error);
            return ResponseEntity.badRequest().body(errors);
        }

        // Validation to prevent changing of status of already disposed beds as you cannot bring back a disposed bed
        boolean isDisposed = bedService.getBedById(id).get().getBedStatus().equals("disposed");
        boolean isNewStatusDisposed = model.getBedStatus().equals("disposed");

        // If the bed is already disposed and the new status is not disposed
        // then return a bad request
        if (isDisposed && !isNewStatusDisposed) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "This bed is already disposed.");
            error.put("target", "model");
            errors.add(error);
            return ResponseEntity.badRequest().body(errors);
        }

        model.setId(id); // Set the id of the model to the id from the path
        return ResponseEntity.ok(bedService.updateBed(id, model)); // update the bed and return it
    }
}
