package aoop.quicker.service;

import aoop.quicker.model.PatientsHMO;
import aoop.quicker.repository.PatientsHMORepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PatientsHMOService {
    private final PatientsHMORepository patientsHMORepository;

    public PatientsHMOService(PatientsHMORepository patientsHMORepository) {
        this.patientsHMORepository = patientsHMORepository;
    }

    public Optional<PatientsHMO> getPatientsHMOByAdmissionID(Integer id) {
        return patientsHMORepository.findAllByAdmissionID(id);
    }

    public PatientsHMO addPatientsHMO(PatientsHMO patientsHMO) {
        return patientsHMORepository.save(patientsHMO);
    }

    public PatientsHMO updatePatientsHMO(Integer id, PatientsHMO patientsHMO) {
        patientsHMO.setId(id);
        return patientsHMORepository.save(patientsHMO);
    }
}
