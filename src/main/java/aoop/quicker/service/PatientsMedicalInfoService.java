package aoop.quicker.service;

import aoop.quicker.model.Patient;
import aoop.quicker.model.PatientsMedicalInfo;
import aoop.quicker.repository.PatientsMedicalInfoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import javax.persistence.criteria.Predicate;
import java.util.Optional;

@Service
public class PatientsMedicalInfoService {
    private final PatientsMedicalInfoRepository patientsMedicalInfoRepository;

    public PatientsMedicalInfoService(PatientsMedicalInfoRepository patientsMedicalInfoRepository) {
        this.patientsMedicalInfoRepository = patientsMedicalInfoRepository;
    }

    public Page<PatientsMedicalInfo> getAllPatientsMedicalInfo(Pageable pageable) {
        return patientsMedicalInfoRepository.findAll(pageable);
    }

    public Page<PatientsMedicalInfo> searchPatientsMedicalInfo(String query, Pageable pageable) {
        Specification<PatientsMedicalInfo> specification = PatientsMedicalInfoSpecifications.buildSpecification(query);
        return patientsMedicalInfoRepository.findAll(specification, pageable);
    }

    public Optional<PatientsMedicalInfo> getPatientsMedicalInfoByPatientId(Integer id) {
        return patientsMedicalInfoRepository.findPatientsMedicalInfoByPatientID(id);
    }

    public PatientsMedicalInfo addPatientsMedicalInfo(PatientsMedicalInfo patientsMedicalInfo) {
        return patientsMedicalInfoRepository.save(patientsMedicalInfo);
    }

    public PatientsMedicalInfo updatePatientsMedicalInfo(Integer id, PatientsMedicalInfo patientsMedicalInfo) {
        patientsMedicalInfo.setId(id);
        return patientsMedicalInfoRepository.save(patientsMedicalInfo);
    }

    /*
     * Inner class to build the Specification for the PatientsMedicalInfo entity
     * This class is used to build the Predicate for the query
     * The Predicate is used to filter the results based on the query
     * The query can be a name, triage, status, bed location code, admit on, or out on
     * The query is split into terms, and each term is used to build a Predicate
     * The Predicates are then ANDed together to form the final Predicate
     * The final Predicate is used to filter the results
     */
    private class PatientsMedicalInfoSpecifications {
        public static Specification<PatientsMedicalInfo> buildSpecification(String query) {
            return (root, criteriaQuery, criteriaBuilder) -> { // Lambda function for Predicate building
                if (query == null || query.isEmpty()) {
                    return null;
                }
                Predicate finalPredicate = null;
                String[] terms = query.split("\\s+"); // Split query into terms
                for (String term : terms) {
                    Predicate predicate = null;
                    if (term.matches("^\\d+(\\.\\d+)?$")) {
                        /*
                        * Regex for height or weight
                        * \d+ - Matches one or more digits
                        * \. - Matches a period
                        * \d+ - Matches one or more digits
                        * (\.\\d+)? - Matches a period followed by one or more digits, zero or one time
                         */
                        Predicate heightEquals = criteriaBuilder.equal(root.get("height"), Double.parseDouble(term));
                        Predicate weightEquals = criteriaBuilder.equal(root.get("weight"), Double.parseDouble(term));
                    } else {
                        Predicate allergiesContains = criteriaBuilder.like(root.get("patientMedNfoAllergies"), "%" + term + "%");
                        Predicate medicationsContains = criteriaBuilder.like(root.get("patientMedNfoMedications"), "%" + term + "%");
                        Predicate comorbiditiesContains = criteriaBuilder.like(root.get("patientMedNfoComorbidities"), "%" + term + "%");
                        Predicate historyContains = criteriaBuilder.like(root.get("patientMedNfoHistory"), "%" + term + "%");
                        Predicate immunizationContains = criteriaBuilder.like(root.get("patientMedNfoImmunization"), "%" + term + "%");
                        Predicate familyHistoryContains = criteriaBuilder.like(root.get("patientMedNfoFamilyHistory"), "%" + term + "%");
                        Predicate covidVaxxContains = criteriaBuilder.like(root.get("patientMedNfoCOVIDVaxx"), "%" + term + "%");
                        predicate = criteriaBuilder.or(allergiesContains, medicationsContains, comorbiditiesContains, historyContains, immunizationContains, familyHistoryContains, covidVaxxContains);
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
