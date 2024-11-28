package aoop.quicker.repository;

import aoop.quicker.model.PatientsPhilHealth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface PatientsPhilHealthRepository extends JpaRepository<PatientsPhilHealth, Integer>, JpaSpecificationExecutor<PatientsPhilHealth> {
    Optional<PatientsPhilHealth> findAllByAdmissionID(Integer admissionID);
}
