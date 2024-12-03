package aoop.quicker.service;

import aoop.quicker.model.Patient;
import aoop.quicker.model.PatientBilling;
import aoop.quicker.repository.PatientBillingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import java.util.List;
import java.util.Optional;

@Service
public class PatientBillingService {
    final String DRIVER = "com.microsoft.sqlserver.jdbc.SQLServerDriver";
    final String URL;

    private final PatientBillingRepository patientBillingRepository;
    private EntityManager entityManager;

    public PatientBillingService(PatientBillingRepository patientBillingRepository,
                                 EntityManager entityManager,
                                 @Value("${spring.datasource.url}") String url
                                 ) {
        this.patientBillingRepository = patientBillingRepository;
        this.entityManager = entityManager;
        this.URL = url;
    }

    public Page<PatientBilling> getAllPatientBillingByAdmissionID(Integer id, Pageable pageable) {
        return patientBillingRepository.finAllByAdmissionID(id, pageable);
    }

    public List<PatientBilling> getAllPatientBillingByAdmissionID(Integer id) {
        return patientBillingRepository.findAllByAdmissionID(id);
    }

    public Optional<PatientBilling> getPatientBillingByAdmissionIDAndDetails(Integer admissionID, String details) {
        return patientBillingRepository.findByAdmissionIDAndBillingItemDetails(admissionID, details);
    }

    public boolean patientBillingExists(Integer admissionID, String details) {
        return patientBillingRepository.existsByAdmissionIDAndBillingItemDetails(admissionID, details);
    }

    public boolean patientBillingExistsByAdmissionIDAndDetails(Integer admissionID, String details) {
        return patientBillingRepository.existsPatientBillingByAdmissionIDAndBillingItemDetails(admissionID, details);
    }

    public PatientBilling savePatientBilling(PatientBilling patientBilling) {
        return patientBillingRepository.save(patientBilling);
    }

    public PatientBilling updatePatientBilling(Integer id, PatientBilling patientBilling) {
        patientBilling.setId(id);
        return patientBillingRepository.save(patientBilling);
    }

}
