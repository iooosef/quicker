package aoop.quicker.repository;

import aoop.quicker.model.PatientLabOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PatientLabOrderRepository extends JpaRepository<PatientLabOrder, Integer>, JpaSpecificationExecutor<PatientLabOrder> {
}
