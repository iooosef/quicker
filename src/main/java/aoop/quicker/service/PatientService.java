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
        String[] keywords = query.split("\\s+");
        return patientRepository.findByKeywords(keywords, pageable);
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
}
