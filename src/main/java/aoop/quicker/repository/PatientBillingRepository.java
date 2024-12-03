package aoop.quicker.repository;

import aoop.quicker.model.PatientBilling;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface PatientBillingRepository extends JpaRepository<PatientBilling, Integer>, JpaSpecificationExecutor<PatientBilling> {
    Optional<PatientBilling> findByAdmissionIDAndBillingItemDetails(Integer admissionID, String details);
    boolean existsByAdmissionIDAndBillingItemDetails(Integer admissionID, String details);
    Page<PatientBilling> findAllByAdmissionID(Integer id, Pageable pageable);
    List<PatientBilling> findAllByAdmissionID(Integer id);
    boolean existsPatientBillingByAdmissionIDAndBillingItemDetails(Integer admissionID, String billingItemDetails);
}
