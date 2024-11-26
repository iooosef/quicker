package aoop.quicker.service;

import aoop.quicker.model.PatientAdmission;
import aoop.quicker.repository.PatientAdmissionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import javax.persistence.criteria.Predicate;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class PatientAdmissionService {
    private final PatientAdmissionRepository patientAdmissionRepository;

    public PatientAdmissionService(PatientAdmissionRepository patientAdmissionRepository) {
        this.patientAdmissionRepository = patientAdmissionRepository;
    }

    public Page<PatientAdmission> getAllPatientAdmissions(Pageable pageable) {
        return patientAdmissionRepository.findAll(pageable);
    }

    public Page<PatientAdmission> searchPatientAdmissions(String query, Pageable pageable) {
        Specification<PatientAdmission> specification = PatientAdmissionSpecifications.buildSpecification(query);
        return patientAdmissionRepository.findAll(specification, pageable);
    }

    public Optional<PatientAdmission> getPatientAdmissionById(Integer id) {
        return patientAdmissionRepository.findById(id);
    }

    public PatientAdmission addPatientAdmission(PatientAdmission patient) {
        return patientAdmissionRepository.save(patient);
    }

    public PatientAdmission updatePatientAdmission(Integer id, PatientAdmission patient) {
        patient.setId(id);
        return patientAdmissionRepository.save(patient);
    }

    /*
        * isPatientAddedInTheLast
        * - Check if the patient with the given name was added in the last duration
        * - The duration is the time period to check if the patient was added in
        * - The patient is considered to be added if the patient is still in the ER
        * - The patient is still in the ER if the patient status is not Discharged, Transferred, or Moved to Morgue
     */
    public boolean isPatientAdmissionAddedInTheLast(String patientName, Duration duration) {
        Instant lastDuration = Instant.now().minus(duration);
        List<PatientAdmission> patients = patientAdmissionRepository.findAllByPatientNameAndPatientAdmitOn(patientName, lastDuration);
        boolean existFlag = false;
        for (PatientAdmission patient : patients) {
            boolean patientNameEquals = patient.getPatientName().equals(patientName);
            boolean patientStatusDischarged = patient.getPatientStatus().equals("Discharged");
            boolean patientStatusTransferred = patient.getPatientStatus().equals("Transferred");
            boolean patientStatusMovedToMorgue = patient.getPatientStatus().equals("Moved to Morgue");
            boolean patientStillInER = !patientStatusDischarged &&
                                        !patientStatusTransferred &&
                                        !patientStatusMovedToMorgue;
            if (patientNameEquals && patientStillInER) {
                existFlag = true;
            }
        }

        return existFlag;
    }

    /*
        * Inner class to build the Specification for the PatientAdmission entity
        * This class is used to build the Predicate for the query
        * The Predicate is used to filter the results based on the query
        * The query can be a name, triage, status, bed location code, admit on, or out on
        * The query is split into terms, and each term is used to build a Predicate
        * The Predicates are then ANDed together to form the final Predicate
        * The final Predicate is used to filter the results
     */
    private class PatientAdmissionSpecifications {
        public static Specification<PatientAdmission> buildSpecification(String query) {
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
                        predicate = criteriaBuilder.equal(root.get("patientTriage"), Integer.parseInt(term));
                    }
                    // regex for "before:" and "after:" search
                    else if (term.matches("before:\\d{4}-\\d{2}-\\d{2}")) {
                        Instant instant = Instant.parse(term.substring(7) + "T00:00:00Z");
                        predicate = criteriaBuilder.lessThanOrEqualTo(root.get("patientAdmitOn"), instant);
                    } else if (term.matches("after:\\d{4}-\\d{2}-\\d{2}")) {
                        Instant instant = Instant.parse(term.substring(6) + "T00:00:00Z");
                        predicate = criteriaBuilder.greaterThanOrEqualTo(root.get("patientAdmitOn"), instant);
                    } else {
                        Predicate nameContains = criteriaBuilder.like(root.get("patientName"), "%" + term + "%");
                        Predicate statusContains = criteriaBuilder.like(root.get("patientStatus"), "%" + term + "%");
                        Predicate bedLocCodeContains = criteriaBuilder.like(root.get("patientBedLocCode"), "%" + term + "%");
                        predicate = criteriaBuilder.or(nameContains, statusContains, bedLocCodeContains);
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
