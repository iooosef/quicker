package aoop.quicker.repository;

import aoop.quicker.model.PatientLabOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface PatientLabOrderRepository extends JpaRepository<PatientLabOrder, Integer>, JpaSpecificationExecutor<PatientLabOrder> {
    Page<PatientLabOrder> findAllByAdmissionID(Integer id, Pageable pageable);
    Optional<PatientLabOrder> findByAdmissionID(Integer id);
}
