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
        Specification<Bed> specification = BedSpecifications.buildSpecification(query);
        return bedRepository.findAll(specification, pageable);
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

    /*
        * Inner class to build the Specification for the Bed entity
        * This class is used to build the Predicate for the query
        * The Predicate is used to filter the results based on the query
        * The query can be a location code or status
        * The query is split into terms, and each term is used to build a Predicate
        * The Predicates are then ORed together to form the final Predicate
        * The final Predicate is used to filter the results
     */
    private class BedSpecifications {
        public static Specification<Bed> buildSpecification(String query) {
            return (root, citeriaQuery, criteriaBuilder) -> { // Lambda function for Predicate building
                if (query == null || query.isBlank()) { // No query
                    return null;
                }
                Predicate finalPredicate = null;
                String[] terms = query.split("\\s+"); // Split query into terms
                for (String term : terms) {
                    Predicate predicate = null;
                    Predicate locCodeContains = criteriaBuilder.like(root.get("bedLocCode"), "%" + term + "%");
                    Predicate statusContains = criteriaBuilder.like(root.get("bedStatus"), "%" + term + "%");
                    predicate = criteriaBuilder.or(locCodeContains, statusContains);

                    if (finalPredicate == null) { // at first, finalPredicate is null, so we assign the first predicate
                        finalPredicate = predicate;
                    } else { // after the first predicate, we AND the predicates together
                        finalPredicate = criteriaBuilder.and(finalPredicate, predicate);
                    }
                }

                return finalPredicate;
            };
        }
    }
}
