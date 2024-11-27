package aoop.quicker.repository;

import aoop.quicker.model.Patient;
import aoop.quicker.model.PatientLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface PatientLogRepository extends JpaRepository<PatientLog, Integer>, JpaSpecificationExecutor<PatientLog> {
    Page<PatientLog> findAll(Pageable pageable);
    Page<PatientLog> findAllByAdmissionID(Integer id, Pageable pageable);
    Optional<PatientLog> findByAdmissionID(Integer id);
}
