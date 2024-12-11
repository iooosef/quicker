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
        String[] keywords = query.split("\\s+");
        return patientAdmissionRepository.findByKeywords(keywords, pageable);
    }

    public Optional<PatientAdmission> getPatientAdmissionById(Integer id) {
        return patientAdmissionRepository.findById(id);
    }

    public Optional<PatientAdmission> getPatientAdmissionOfUnoccupiedBed(String bedLocation) {
        return patientAdmissionRepository.findOccupiedBedLocation(bedLocation);
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
    public boolean isPatientAdmissionAddedInTheLast(String patientName, String erCause, Duration duration) {
        Instant lastDuration = Instant.now().minus(duration);
        List<PatientAdmission> patients = patientAdmissionRepository.findAllByPatientNameAndPatientAdmitOnGreaterThan(patientName, lastDuration);
        boolean existFlag = false;
        for (PatientAdmission patient : patients) {
            boolean patientNameEquals = patient.getPatientName().equals(patientName);
            boolean patientERCauseEquals = patient.getPatientERCause().equals(erCause);
            boolean patientStatusDischarged = patient.getPatientStatus().equals("Discharged");
            boolean patientStatusTransferred = patient.getPatientStatus().equals("Transferred");
            boolean patientStatusMovedToMorgue = patient.getPatientStatus().equals("Moved to Morgue");
            boolean patientStillInER = !patientStatusDischarged &&
                                        !patientStatusTransferred &&
                                        !patientStatusMovedToMorgue;
            if (patientStillInER && patientNameEquals && patientERCauseEquals) {
                existFlag = true;
            }
        }

        return existFlag;
    }
}
