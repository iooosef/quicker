package aoop.quicker.service;

import aoop.quicker.model.Bed;
import aoop.quicker.repository.BedRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import javax.persistence.criteria.Predicate;
import java.util.Optional;

@Service
public class BedService {
    private final BedRepository bedRepository;

    public BedService(BedRepository bedRepository) {
        this.bedRepository = bedRepository;
    }

    // For the unfiltered pageable table
    public Page<Bed> getAllBeds(Pageable pageable) {
        return bedRepository.findAll(pageable);
    }

    public Page<Bed> searchBeds(String query, Pageable pageable) {
        String[] keywords = query.split("\\s+");
        return bedRepository.findByKeywords(keywords, pageable);
    }

    // Get Bed by ID
    public Optional<Bed> getBedById(Integer id) {
        return bedRepository.findById(id);
    }

    // For adding a new bed
    public Bed addBed(Bed bed) {
        return bedRepository.save(bed);
    }

    // For updating a bed
    public Bed updateBed(Integer id, Bed bed) {
        bed.setId(id);
        return bedRepository.save(bed);
    }

    // For checking if the bedLocCod is already available
    public boolean isAlreadyAvailable(String bedLocCode) {
        var isAvailable = bedRepository.findBedByBedLocCodeAndBedStatusIs(bedLocCode, "Available");
        return isAvailable.isPresent();
    }
}
