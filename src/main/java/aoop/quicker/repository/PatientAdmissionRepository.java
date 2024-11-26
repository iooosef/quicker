package aoop.quicker.repository;

import aoop.quicker.model.PatientAdmission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.Instant;
import java.util.List;

public interface PatientAdmissionRepository extends JpaRepository<PatientAdmission, Integer>, JpaSpecificationExecutor<PatientAdmission> {
    Page<PatientAdmission> findAll(Pageable pageable);
    List<PatientAdmission> findAllByPatientNameAndPatientAdmitOnGreaterThan(String patientName, Instant patientAdmitOn);
}
