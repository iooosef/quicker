package aoop.quicker.repository;

import aoop.quicker.model.PatientsMedicalInfo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface PatientsMedicalInfoRepository extends JpaRepository<PatientsMedicalInfo, Integer>, JpaSpecificationExecutor<PatientsMedicalInfo> {
    Page<PatientsMedicalInfo> findAll(Pageable pageable);
    Optional<PatientsMedicalInfo> findPatientsMedicalInfoByPatientID(Integer id);
}
