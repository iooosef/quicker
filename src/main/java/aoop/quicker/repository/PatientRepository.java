package aoop.quicker.repository;

import aoop.quicker.model.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.Instant;
import java.util.List;

public interface PatientRepository extends JpaRepository<Patient, Integer>, JpaSpecificationExecutor<Patient> {
    Page<Patient> findAll(Pageable pageable);
    List<Patient> findAllByPatientNameAndPatientAddedOn(String patientName, Instant patientAddedOn);
}
