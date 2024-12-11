package aoop.quicker.repository;

import aoop.quicker.model.PatientAdmission;
import aoop.quicker.model.Supply;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import javax.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Optional;

public interface SupplyRepository extends JpaRepository<Supply, Integer>, JpaSpecificationExecutor<Supply> {
    Page<Supply> findAll(Pageable pageable);
    Optional<Supply> findSupplyBySupplyNameAndSupplyType(String supplyName, String supplyType);
    Optional<Supply> findSupplyBySupplyName(String supplyName);
    boolean existsBySupplyName(String supplyName);
    boolean existsSupplyBySupplyNameAndSupplyType(String supplyName, String supplyType);
    default Page<Supply> findByKeywords(String[] keywords, Pageable pageable) {
        return findAll((root, query, criteriaBuilder) -> {
            Predicate[] predicates = Arrays.stream(keywords)
                    .map(keyword -> {
                        String pattern = "%" + keyword + "%";
                        var finalCriteria = criteriaBuilder.or(
                                criteriaBuilder.like(root.get("supplyName"), pattern),
                                criteriaBuilder.like(root.get("supplyType"), pattern)
                        );
                        if (keyword.matches("\\d+")) {
                            finalCriteria = criteriaBuilder.or(
                                    finalCriteria,
                                    criteriaBuilder.equal(root.get("id"), Integer.parseInt(keyword))
                            );
                        }
                        if(keyword.matches("(?i)^(\\$|PHP)\\s?\\d+(\\.\\d+)?$")) {
                            String amount = keyword.replaceAll("(?i)^(\\$|PHP)\\s?", ""); // Remove currency symbol
                            finalCriteria = criteriaBuilder.or(
                                    finalCriteria,
                                    criteriaBuilder.equal(root.get("supplyPrice"), new BigDecimal(amount))
                            );
                        }
                        return finalCriteria;
                    })
                    .toArray(Predicate[]::new);
            return criteriaBuilder.and(predicates);
        }, pageable);
    }
}