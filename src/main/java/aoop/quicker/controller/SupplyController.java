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
    public Supply addSupply(@RequestBody Supply model) {
        return supplyService.addSupply(model);
    }

    @PutMapping(value="/update/{id}", produces=MediaType.APPLICATION_JSON_VALUE)
    public Supply updateSupply(@PathVariable int id, @RequestBody Supply model) {
        return supplyService.updateSupply(id, model);
    }
}
