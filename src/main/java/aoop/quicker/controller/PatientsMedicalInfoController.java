package aoop.quicker.controller;

import aoop.quicker.model.PatientsMedicalInfo;
import aoop.quicker.service.PatientsMedicalInfoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/*
 * Patient Medical Info Controller
 *  - Handles patient medical info operations
 *  - Spring Boot REST Controller
 */
/*
 - PAGOD NA AKO 😭😭😭😭😭
 - SAWA NA AKO MAG-CODE
 */
@RestController
@RequestMapping("/patients-medical-info")
public class PatientsMedicalInfoController {
    private final Logger log = LoggerFactory.getLogger(PatientsMedicalInfoController.class);
    private final PatientsMedicalInfoService patientsMedicalInfoService;

    // Constructor for PatientsMedicalInfoController
    // - allows for dependency injection of PatientsMedicalInfoService
    public PatientsMedicalInfoController(PatientsMedicalInfoService patientsMedicalInfoService) {
        this.patientsMedicalInfoService = patientsMedicalInfoService;
    }

    // Handles GET request for all patient medical info
    @RequestMapping(value="/all", produces= MediaType.APPLICATION_JSON_VALUE)
    public Page<PatientsMedicalInfo> getPatientsMedicalInfo(@RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size); // create pageable object
        // get all patient medical info as a page object
        Page<PatientsMedicalInfo> patientsMedicalInfo = patientsMedicalInfoService.getAllPatientsMedicalInfo(pageable);
        log.info(patientsMedicalInfo.toString());
        return patientsMedicalInfo;
    }

    // Handles GET request for patient medical info by patient ID
    @RequestMapping(value="/{id}", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getPatientsMedicalInfoByPatientId(@PathVariable int id) {
        List errors = new ArrayList();
        var patientsMedicalInfo = patientsMedicalInfoService.getPatientsMedicalInfoByPatientId(id);
        // if patient medical info not found, return 404
        if (!patientsMedicalInfo.isPresent()) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "not_found_error");
            error.put("message", "Medical Record not found");
            error.put("target", "model");
            errors.add(error);
            return ResponseEntity.status(404).body(errors);
        }
        return ResponseEntity.ok(patientsMedicalInfo.get());
    }

    // Handles POST request to add patient medical info
    @PostMapping(value="/record", produces= MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addPatientsMedicalInfo(@RequestBody PatientsMedicalInfo model) {
        List errors = validateModel(model);
        boolean patientIDExists = patientsMedicalInfoService.getPatientsMedicalInfoByPatientId(model.getPatientID()).isPresent();
        // if patient medical info already exists, return 400
        if (patientIDExists) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Medical Record already exists for this patient");
            error.put("target", "model");
            errors.add(error);
        }
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        return ResponseEntity.ok(patientsMedicalInfoService.addPatientsMedicalInfo(model));
    }

    // Handles PUT request to update patient medical info by patient ID
    @PutMapping(value="/record/{id}", produces= MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updatePatientsMedicalInfo(@PathVariable int id, @RequestBody PatientsMedicalInfo patientsMedicalInfo) {
        List errors = validateModel(patientsMedicalInfo); // validate model
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        // prevent editing of Patient ID by overriding to the original Patient ID
        int patientID = patientsMedicalInfoService.getPatientsMedicalInfoByPatientId(id).get().getPatientID();
        patientsMedicalInfo.setPatientID(patientID);
        // update patient medical info
        return ResponseEntity.ok(patientsMedicalInfoService.updatePatientsMedicalInfo(id, patientsMedicalInfo));
    }

    // Helper method to validate patient medical info model
    private List validateModel(PatientsMedicalInfo model) {
        List errors = new ArrayList();
        // check if required fields are present
        if (model.getPatientMedNfoHeight() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Height is required");
            error.put("target", "patientMedNfoHeight");
            errors.add(error);
        }
        if (model.getPatientMedNfoWeight() == null) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "Weight is required");
            error.put("target", "patientMedNfoWeight");
            errors.add(error);
        }
        return errors;
    }
}
