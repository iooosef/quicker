package aoop.quicker.repository;

import aoop.quicker.model.Patient;
import aoop.quicker.model.PatientAdmission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import javax.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Arrays;

public interface PatientRepository extends JpaRepository<Patient, Integer>, JpaSpecificationExecutor<Patient> {
    Page<Patient> findAll(Pageable pageable);
    boolean existsByPatientFullNameAndPatientGenderIsAndPatientDOBIs(String patientFullName, String patientGender, Instant patientDOB);
    default Page<Patient> findByKeywords(String[] keywords, Pageable pageable) {
        return findAll((root, query, criteriaBuilder) -> {
            Predicate[] predicates = Arrays.stream(keywords)
                    .map(keyword -> {
                        String pattern = "%" + keyword + "%";
                        var finalCriteria = criteriaBuilder.or(
                                criteriaBuilder.like(root.get("patientFullName"), pattern),
                                criteriaBuilder.like(root.get("patientGender"), pattern),
                                criteriaBuilder.like(root.get("patientAddress"), pattern),
                                criteriaBuilder.like(root.get("patientContactNum"), pattern),
                                criteriaBuilder.like(root.get("patientEmergencyContactName"), pattern),
                                criteriaBuilder.like(root.get("patientEmergencyContactNum"), pattern)
                        );
                        if(keyword.matches("\\d+")) {
                            finalCriteria = criteriaBuilder.or(
                                    finalCriteria,
                                    criteriaBuilder.equal(root.get("id"), Integer.parseInt(keyword))
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
