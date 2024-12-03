package aoop.quicker.service;

import aoop.quicker.model.Patient;
import aoop.quicker.repository.PatientRepository;
import jdk.jfr.Period;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import javax.persistence.criteria.Predicate;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
public class PatientService {
    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public Page<Patient> getAllPatients(Pageable pageable) {
        return patientRepository.findAll(pageable);
    }

    public Page<Patient> searchPatients(String query, Pageable pageable) {
        Specification<Patient> specification = PatientSpecifications.buildSpecification(query);
        return patientRepository.findAll(specification, pageable);
    }

    public Optional<Patient> getPatientById(Integer id) {
        return patientRepository.findById(id);
    }

    public int getPatientAgeById(Integer id) {
        Optional<Patient> patient = patientRepository.findById(id);
        if (patient.isPresent()) {
            Instant dob = patient.get().getPatientDOB();
            Instant now = Instant.now();
            var age = ChronoUnit.YEARS.between(LocalDate.ofInstant(dob, ZoneId.systemDefault()), LocalDate.ofInstant(now, ZoneId.systemDefault()));
            return (int) age;
        } else {
            return -1;
        }
    }

    public Patient addPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    public Patient updatePatient(Integer id, Patient patient) {
        patient.setId(id);
        return patientRepository.save(patient);
    }

    public boolean isPatientExists(String patientFullName, String patientGender, Instant patientDOB) {
        return patientRepository.existsByPatientFullNameAndPatientGenderIsAndPatientDOBIs(patientFullName, patientGender, patientDOB);
    }

    /*
     * Inner class to build the Specification for the Patient entity
     * This class is used to build the Predicate for the query
     * The Predicate is used to filter the results based on the query
     * The query can be a name, triage, status, bed location code, admit on, or out on
     * The query is split into terms, and each term is used to build a Predicate
     * The Predicates are then ANDed together to form the final Predicate
     * The final Predicate is used to filter the results
     */
    private class PatientSpecifications {
        public static Specification<Patient> buildSpecification(String query) {
            return (root, criteriaQuery, criteriaBuilder) -> { // Lambda function for Predicate building
                if (query == null || query.isEmpty()) {
                    return null;
                }
                Predicate finalPredicate = null;
                String[] terms = query.split("\\s+"); // Split query into terms
                for (String term : terms) {
                    Predicate predicate = null;
                    Predicate nameContains = criteriaBuilder.like(root.get("patientFullName"), "%" + term + "%");
                    Predicate genderContains = criteriaBuilder.like(root.get("patientGender"), "%" + term + "%");
                    Predicate addressContains = criteriaBuilder.like(root.get("patientAddress"), "%" + term + "%");
                    Predicate contactNumContains = criteriaBuilder.like(root.get("patientContactNum"), "%" + term + "%");
                    Predicate emergencyContactNameContains = criteriaBuilder.like(root.get("patientEmergencyContactName"), "%" + term + "%");
                    Predicate emergencyContactNumContains = criteriaBuilder.like(root.get("patientEmergencyContactNum"), "%" + term + "%");
                    Predicate pwdIDContains = criteriaBuilder.like(root.get("patientPWDID"), "%" + term + "%");
                    Predicate seniorIDContains = criteriaBuilder.like(root.get("patientSeniorID"), "%" + term + "%");
                    predicate = criteriaBuilder.or(nameContains, genderContains, addressContains, contactNumContains, emergencyContactNameContains, emergencyContactNumContains, pwdIDContains, seniorIDContains);

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
