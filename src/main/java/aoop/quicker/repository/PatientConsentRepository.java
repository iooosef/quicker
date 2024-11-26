package aoop.quicker.repository;

import aoop.quicker.model.PatientConsent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;


public interface PatientConsentRepository extends JpaRepository<PatientConsent, Integer>, JpaSpecificationExecutor<PatientConsent>  {
    Page<PatientConsent> findAll(Pageable pageable);
    Optional<PatientConsent> findByAdmissionID(Integer admissionID);
}
