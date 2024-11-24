package aoop.quicker.service;

import aoop.quicker.model.Patient;
import aoop.quicker.repository.PatientRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
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

    public Optional<Patient> getPatientById(Integer id) {
        return patientRepository.findById(id);
    }

    public Patient addPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    public Patient updatePatient(Integer id, Patient patient) {
        patient.setId(id);
        return patientRepository.save(patient);
    }

    /*
        * isPatientAddedInTheLast
        * - Check if the patient with the given name was added in the last duration
        * - The duration is the time period to check if the patient was added in
        * - The patient is considered to be added if the patient is still in the ER
        * - The patient is still in the ER if the patient status is not Discharged, Transferred, or Moved to Morgue
     */
    public boolean isPatientAddedInTheLast(String patientName, Duration duration) {
        Instant lastDuration = Instant.now().minus(duration);
        List<Patient> patients = patientRepository.findAllByPatientNameAndPatientAddedOn(patientName, lastDuration);
        boolean existFlag = false;
        for (Patient patient : patients) {
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

}
