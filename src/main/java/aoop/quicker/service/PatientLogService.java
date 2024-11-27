package aoop.quicker.service;

import aoop.quicker.model.Patient;
import aoop.quicker.model.PatientLog;
import aoop.quicker.repository.PatientLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import javax.persistence.criteria.Predicate;
import java.time.Instant;
import java.util.Optional;

@Service
public class PatientLogService {
    private final PatientLogRepository patientLogRepository;

    public PatientLogService(PatientLogRepository patientLogRepository) {
        this.patientLogRepository = patientLogRepository;
    }

    public Page<PatientLog> getAllPatientLogsByAdmissionID(Integer id, Pageable pageable) {
        return patientLogRepository.findAllByAdmissionID(id, pageable);
    }

    public Optional<PatientLog> getPatientLogByID(Integer id) {
        return patientLogRepository.findById(id);
    }

    public Page<PatientLog> searchPatientLogs(String query, Integer admissionID, Pageable pageable) {
        Specification<PatientLog> specification = PatientLogSpecificiations.buildSpecification(query, admissionID);
        return patientLogRepository.findAll(specification, pageable);
    }

    public PatientLog addPatientLog(PatientLog patientLog) {
        return patientLogRepository.save(patientLog);
    }

    public PatientLog updatePatientLog(Integer id, PatientLog patientLog) {
        patientLog.setAdmissionID(id);
        return patientLogRepository.save(patientLog);
    }

    /*
     * Inner class to build the Specification for the PatientLog entity
     * This class is used to build the Predicate for the query
     * The Predicate is used to filter the results based on the query
     * The query can be a name, triage, status, bed location code, admit on, or out on
     * The query is split into terms, and each term is used to build a Predicate
     * The Predicates are then ANDed together to form the final Predicate
     * The final Predicate is used to filter the results
     */
    private class PatientLogSpecificiations {
        public static Specification<PatientLog> buildSpecification(String query, Integer admissionID) {
            return (root, criteriaQuery, criteriaBuilder) -> { // Lambda function for Predicate building
                if (query == null || query.isEmpty()) {
                    return null;
                }
                Predicate finalPredicate = null;

                // Enforce all results have the same AdmissionID
                if (admissionID != null && !admissionID.equals(0)) {
                    Predicate admissionIDPredicate = criteriaBuilder.equal(root.get("admissionID"), admissionID);
                    finalPredicate = admissionIDPredicate; // Initialize finalPredicate with AdmissionID filter
                }

                String[] terms = query.split("\\s+"); // Split query into terms
                for (String term : terms) {
                    Predicate predicate = null;
                    // regex for date format and "before:" and "after:" keywords
                    if (term.matches("before:\\d{4}-\\d{2}-\\d{2}")) {
                        Instant instant = Instant.parse(term.substring(7) + "T00:00:00Z");
                        predicate = criteriaBuilder.lessThanOrEqualTo(root.get("patientLogOn"), instant);
                    } else if (term.matches("after:\\d{4}-\\d{2}-\\d{2}")) {
                        Instant instant = Instant.parse(term.substring(7) + "T00:00:00Z");
                        predicate = criteriaBuilder.greaterThanOrEqualTo(root.get("patientLogOn"), instant);
                    } else if (term.matches("\\d{4}-\\d{2}-\\d{2}")) {
                        Instant instant = Instant.parse(term.substring(7) + "T00:00:00Z");
                        predicate = criteriaBuilder.equal(root.get("patientLogOn"), instant);
                    } else {
                        Predicate patientLogMsgContains = criteriaBuilder.like(root.get("patientLogMsg"), "%" + term + "%");
                        Predicate patientLogByContains = criteriaBuilder.like(root.get("patientLogBy"), "%" + term + "%");
                        Predicate admissionIDContains = criteriaBuilder.like(root.get("admissionID").as(String.class), "%" + term + "%");
                        predicate = criteriaBuilder.or(patientLogMsgContains, patientLogByContains, admissionIDContains);
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
