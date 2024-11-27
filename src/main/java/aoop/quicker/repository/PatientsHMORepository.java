package aoop.quicker.repository;

import aoop.quicker.model.PatientsHMO;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface PatientsHMORepository extends JpaRepository<PatientsHMO, Integer>, JpaSpecificationExecutor<PatientsHMO> {
    Optional<PatientsHMO> findAllByAdmissionID(Integer admissionID);
}
