package aoop.quicker.repository;

import aoop.quicker.model.PatientTreatmentOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PatientTreatmentOrderRepository extends JpaRepository<PatientTreatmentOrder, Integer>, JpaSpecificationExecutor<PatientTreatmentOrder> {
}
