package aoop.quicker.repository;

import aoop.quicker.model.PatientAdmission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import javax.persistence.criteria.Predicate;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

public interface PatientAdmissionRepository extends JpaRepository<PatientAdmission, Integer>, JpaSpecificationExecutor<PatientAdmission> {
    Page<PatientAdmission> findAll(Pageable pageable);
    List<PatientAdmission> findAllByPatientNameAndPatientAdmitOnGreaterThan(String patientName, Instant patientAdmitOn);

    @Query("SELECT p FROM PatientAdmission p " +
            "WHERE p.patientBedLocCode = ?1 " +
                "AND (p.patientStatus = 'admitted-ER' " +
                    "OR p.patientStatus = 'in-surgery' " +
                    "OR p.patientStatus = 'pending-pay-to-discharge' " +
                    "OR p.patientStatus = 'pending-pay-to-transfer' " +
                    "OR p.patientStatus = 'to-morgue' " +
                    "OR p.patientStatus = 'to-ward')")
    Optional<PatientAdmission> findOccupiedBedLocation(String bedLocation);

    default Page<PatientAdmission> findByKeywords(String[] keywords, Pageable pageable) {
        return findAll((root, query, criteriaBuilder) -> {
            Predicate[] predicates = Arrays.stream(keywords)
                    .map(keyword -> {
                        String pattern = "%" + keyword + "%";
                        var finalCriteria = criteriaBuilder.or(
                                criteriaBuilder.like(root.get("patientName"), pattern),
                                criteriaBuilder.like(root.get("patientStatus"), pattern),
                                criteriaBuilder.like(root.get("patientBedLocCode"), pattern),
                                criteriaBuilder.like(root.get("patientBillingStatus"), pattern),
                                criteriaBuilder.like(root.get("patientERCause"), pattern)
                        );
                        if(keyword.matches("\\d+")) {
                            finalCriteria = criteriaBuilder.or(
                                    finalCriteria,
                                    criteriaBuilder.equal(root.get("patientTriage"), Integer.parseInt(keyword))
                            );
                            finalCriteria = criteriaBuilder.or(
                                    finalCriteria,
                                    criteriaBuilder.equal(root.get("id"), Integer.parseInt(keyword))
                            );
                        }
                        if(keyword.matches("id=\\d+")) {
                            finalCriteria = criteriaBuilder.or(
                                    finalCriteria,
                                    criteriaBuilder.equal(root.get("id"), Integer.parseInt(keyword.substring(3)))
                            );
                        }
                        if(keyword.matches("triage=\\d+")) {
                            finalCriteria = criteriaBuilder.or(
                                    finalCriteria,
                                    criteriaBuilder.equal(root.get("patientTriage"), Integer.parseInt(keyword.substring(7)))
                            );
                        }
                        return finalCriteria;
                    })
                    .toArray(Predicate[]::new);
            query.orderBy(criteriaBuilder.desc(root.get("id")));
            return criteriaBuilder.and(predicates);
        }, pageable);
    }
}
