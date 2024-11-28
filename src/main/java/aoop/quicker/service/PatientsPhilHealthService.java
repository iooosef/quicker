package aoop.quicker.service;

import aoop.quicker.model.PatientsPhilHealth;
import aoop.quicker.repository.PatientsPhilHealthRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PatientsPhilHealthService {
    private final PatientsPhilHealthRepository patientsPhilHealthRepository;

    public PatientsPhilHealthService(PatientsPhilHealthRepository patientsPhilHealthRepository) {
        this.patientsPhilHealthRepository = patientsPhilHealthRepository;
    }

    public Optional<PatientsPhilHealth> getPatientsPhilHealthByAdmissionID(Integer id) {
        return patientsPhilHealthRepository.findAllByAdmissionID(id);
    }

    public PatientsPhilHealth addPatientsPhilHealth(PatientsPhilHealth patientsPhilHealth) {
        return patientsPhilHealthRepository.save(patientsPhilHealth);
    }

    public PatientsPhilHealth updatePatientsPhilHealth(Integer id, PatientsPhilHealth patientsPhilHealth) {
        patientsPhilHealth.setId(id);
        return patientsPhilHealthRepository.save(patientsPhilHealth);
    }
}
