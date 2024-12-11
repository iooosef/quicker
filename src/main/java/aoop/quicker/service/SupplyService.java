package aoop.quicker.service;

import aoop.quicker.model.Supply;
import aoop.quicker.repository.SupplyRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;
import javax.persistence.criteria.Predicate;

@Service
public class SupplyService {
    private final SupplyRepository supplyRepository;

    public SupplyService(SupplyRepository supplyRepository) {
        this.supplyRepository = supplyRepository;
    }

    // For the unfiltered pageable table
    public Page<Supply> getAllSupplies(Pageable pageable) {
        return supplyRepository.findAll(pageable);
    }

    public Page<Supply> searchSupplies(String query, Pageable pageable) {
        String[] keywords = query.split("\\s+");
        return supplyRepository.findByKeywords(keywords, pageable);
    }

    // Get Supply by ID
    public Optional<Supply> getSupplyById(Integer id) {
        return supplyRepository.findById(id);
    }

    public Optional<Supply> getSupplyByNameAndType(String name, String type) {
        return supplyRepository.findSupplyBySupplyNameAndSupplyType(name, type);
    }

    public Optional<Supply> getSupplyByName(String name) {
        return supplyRepository.findSupplyBySupplyName(name);
    }

    // For adding a new supply
    public Supply addSupply(Supply supply) {
        return supplyRepository.save(supply); // Save supply to the database
    }

    // For updating a supply
    public Supply updateSupply(Integer id, Supply supply) {
        supply.setId(id);
        return supplyRepository.save(supply);
    }

    // Supply with the given name exists
    public boolean supplyExists(String supplyName, String supplyTape) {
        return supplyRepository.existsSupplyBySupplyNameAndSupplyType(supplyName, supplyTape);
    }
}
