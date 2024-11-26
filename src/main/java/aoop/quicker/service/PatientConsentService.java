package aoop.quicker.service;

import aoop.quicker.model.PatientConsent;
import aoop.quicker.repository.PatientConsentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PatientConsentService {
    private final PatientConsentRepository patientConsentRepository;

    public PatientConsentService(PatientConsentRepository patientConsentRepository) {
        this.patientConsentRepository = patientConsentRepository;
    }

    public Page<PatientConsent> getAllPatientConsents(Pageable pageable) {
        return patientConsentRepository.findAll(pageable);
    }

    public Optional<PatientConsent> getPatientConsentByAdmissionId(Integer admissionId) {
        return patientConsentRepository.findByAdmissionID(admissionId);
    }

    public PatientConsent addPatientConsent(PatientConsent patientConsent) {
        return patientConsentRepository.save(patientConsent);
    }

    public PatientConsent updatePatientConsent(Integer id, PatientConsent patientConsent) {
        patientConsent.setId(id);
        return patientConsentRepository.save(patientConsent);
    }
}
