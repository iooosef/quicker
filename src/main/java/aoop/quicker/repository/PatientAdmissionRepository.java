package aoop.quicker.repository;

import aoop.quicker.model.PatientAdmission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface PatientAdmissionRepository extends JpaRepository<PatientAdmission, Integer>, JpaSpecificationExecutor<PatientAdmission> {
    Page<PatientAdmission> findAll(Pageable pageable);
    List<PatientAdmission> findAllByPatientNameAndPatientAdmitOnGreaterThan(String patientName, Instant patientAdmitOn);

    @Query("SELECT p FROM PatientAdmission p " +
            "WHERE p.patientBedLocCode = ?1 " +
                "AND (p.patientStatus = 'admitted-ER' " +
                    "OR p.patientStatus = 'in-surgery' " +
                    "OR p.patientStatus = 'pending-pay-to-discharge' " +
                    "OR p.patientStatus = 'pending-pay-to-transfer' " +
                    "OR p.patientStatus = 'to-morgue' " +
                    "OR p.patientStatus = 'to-ward')")
    Optional<PatientAdmission> findOccupiedBedLocation(String bedLocation);
}
