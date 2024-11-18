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
        Specification<Supply> specification = SupplySpecifications.buildSpecification(query);
        return supplyRepository.findAll(specification, pageable);
    }

    // Get Supply by ID
    public Optional<Supply> getSupplyById(Integer id) {
        return supplyRepository.findById(id);
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
    public boolean supplyExists(String supplyName) {
        return supplyRepository.existsBySupplyName(supplyName);
    }

    /*
        * Inner class to build the Specification for the Supply entity
        * This class is used to build the Predicate for the query
        * The Predicate is used to filter the results based on the query
        * The query can be a name, type, quantity, or price
        * The query is split into terms, and each term is used to build a Predicate
        * The Predicates are then ANDed together to form the final Predicate
        * The final Predicate is used to filter the results
     */
    private class SupplySpecifications {
        public static Specification<Supply> buildSpecification(String query) {
            return (root, criteriaQuery, criteriaBuilder) -> { // Lambda function for Predicate building
                if (query == null || query.isBlank()) { // No query
                    return null;
                }
                Predicate finalPredicate = null;
                String[] terms = query.split("\\s+"); // Split query into terms
                for (String term : terms) {
                    Predicate predicate = null;
                    if (term.matches("\\d+")) {
                        /*
                        * Regex for digits: If digits, filter by quantity
                        * \d+ - one or more digits
                        * */
                        predicate = criteriaBuilder.lessThanOrEqualTo(root.get("supplyQty"), Integer.parseInt(term));
                    } else if (term.matches("(?i)^(\\$|PHP)\\s?\\d+(\\.\\d+)?$")) {
                        /*
                        * Regex for currency: If currency, filter by price
                        * (?i) - case insensitive
                        * ^ - start of the line
                        * (\$|PHP) - $ or PHP
                        * \s? - optional space
                        * \d+ - one or more digits
                        * (\.\d+)? - optional decimal part
                        * $ - end of the line
                        * */
                        term = term.replaceAll("(?i)(\\$|PHP)\\s?", ""); // Remove currency symbols
                        predicate = criteriaBuilder.lessThanOrEqualTo(root.get("supplyPrice"), new BigDecimal(term));
                    } else { // Alphanumeric (name or type), filter by name or type
                        Predicate nameContains = criteriaBuilder.like(root.get("supplyName"), "%" + term + "%");
                        Predicate typeContains = criteriaBuilder.like(root.get("supplyType"), "%" + term + "%");
                        predicate = criteriaBuilder.or(nameContains, typeContains);
                    }

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
