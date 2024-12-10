package aoop.quicker.controller;

import aoop.quicker.model.*;
import aoop.quicker.model.viewmodel.FeesSummaryViewModel;
import aoop.quicker.model.viewmodel.StatementOfAccountViewModel;
import aoop.quicker.service.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/patient-billing")
public class PatientBillingController {
    private final Logger log = LoggerFactory.getLogger(PatientBillingController.class);
    private final PatientBillingService patientBillingService;
    private final PatientsHMOService patientsHMOService;
    private final PatientsPhilHealthService patientsPhilHealthService;
    private final SupplyService supplyService;
    private final PatientService patientService;
    private final PatientAdmissionService patientAdmissionService;
    private final String PHILHEALTH_DISCOUNT_DETAILS = "PhilHealth Discount";
    private final String HMO_DISCOUNT_DETAILS = "HMO Discount";
    private final BigDecimal PWD_SENIOR_DISCOUNT_RATE = new BigDecimal("0.20");
    private final ArrayList<String> UNDELETEABLE_DETAILS = new ArrayList<String>() {{
        add("Emergency Room Fee");
        add(PHILHEALTH_DISCOUNT_DETAILS);
        add(HMO_DISCOUNT_DETAILS);
    }};

    public PatientBillingController(PatientBillingService patientBillingService, SupplyService supplyService, PatientService patientService, PatientAdmissionService patientAdmissionService, PatientsPhilHealthService patientsPhilHealthService, PatientsHMOService patientsHMOService) {
        this.patientBillingService = patientBillingService;
        this.patientsHMOService = patientsHMOService;
        this.patientsPhilHealthService = patientsPhilHealthService;
        this.supplyService = supplyService;
        this.patientService = patientService;
        this.patientAdmissionService = patientAdmissionService;
    }

    @RequestMapping(value="/all/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<PatientBilling> getPatientBillingByAdmissionID(@PathVariable int id, @RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PatientBilling> patientBilling = patientBillingService.getAllPatientBillingByAdmissionID(id, pageable);
        log.info(patientBilling.toString());
        return patientBilling;
    }

    @RequestMapping(value="/statement/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getStatementOfAccountByAdmissionID(@PathVariable int id) {
        List errors = new ArrayList();
        // validate to ensure status is pending-pay
        errors.addAll(validatePendingPayStatus(id));
        // validate if PhilHealth discount are added if it exist and approved
        boolean hasPhilHealth = patientsPhilHealthService.getPatientsPhilHealthByAdmissionID(id).isPresent();
        if (hasPhilHealth) {
            errors.addAll(validatePhilHealthApproval(id));
            boolean billingHasPhilHealth = patientBillingService.patientBillingExistsByAdmissionIDAndDetails(id, PHILHEALTH_DISCOUNT_DETAILS);
            if (!billingHasPhilHealth) {
                HashMap<String, String> error = new HashMap<>();
                error.put("type", "invalid_input_error");
                error.put("message", "PhilHealth discount not yet applied");
                error.put("target", "model");
                errors.add(error);
            }
        }
        // validate if HMO discount are added if it exist and approved
        boolean hasHMO = patientsHMOService.getPatientsHMOByAdmissionID(id).isPresent();
        if (hasHMO) {
            errors.addAll(validateHMOApproval(id));
            boolean billingHasHMO = patientBillingService.patientBillingExistsByAdmissionIDAndDetails(id, HMO_DISCOUNT_DETAILS);
            if (!billingHasHMO) {
                HashMap<String, String> error = new HashMap<>();
                error.put("type", "invalid_input_error");
                error.put("message", "HMO discount not yet applied");
                error.put("target", "model");
                errors.add(error);
            }
        }
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }
        addSeniorOrPWDDiscount(id);

        PatientAdmission patientAdmission = patientAdmissionService.getPatientAdmissionById(id).get();
        Patient patient = patientService.getPatientById(patientAdmission.getPatientID()).get();
        StatementOfAccountViewModel statementOfAccount = new StatementOfAccountViewModel();

        statementOfAccount.setPatientId(patientAdmission.getPatientID());
        statementOfAccount.setReferenceNumber(generateRefID() + "-" + patientAdmission.getPatientID());
        statementOfAccount.setPatientName(patient.getPatientFullName());
        statementOfAccount.setPatientAge(patientService.getPatientAgeById(patientAdmission.getPatientID()));
        statementOfAccount.setPatientAddress(patient.getPatientAddress());
        statementOfAccount.setPatientAdmissionCause(patientAdmission.getPatientERCause());
        statementOfAccount.setPWD(!patient.getPatientPWDID().isEmpty());
        statementOfAccount.setSeniorCitizen(!patient.getPatientSeniorID().isEmpty());

        PatientsPhilHealth philHealth = patientsPhilHealthService.getPatientsPhilHealthByAdmissionID(id).get();
        statementOfAccount.setPhilHealthIDNumber(philHealth.getPhilHealthIDNum());
        PatientsHMO hmo = patientsHMOService.getPatientsHMOByAdmissionID(id).get();

        statementOfAccount.setHmoIDNumber(hmo.getHMOIDNum());
        statementOfAccount.setStatus(patientAdmission.getPatientStatus());

        List<FeesSummaryViewModel> feesSummary = new ArrayList<>();
        List<PatientBilling> billings = patientBillingService.getAllPatientBillingByAdmissionID(id);
        BigDecimal totalBalance = new BigDecimal("0.00");
        for (PatientBilling billing : billings) {
            FeesSummaryViewModel fee = new FeesSummaryViewModel();
            fee.setFeeDetails(billing.getBillingItemDetails());
            fee.setFeeCharge(billing.getBillingItemPrice());
            fee.setFeeDiscount(billing.getBillingItemDiscount());
            fee.setFeeTotal(billing.getBillingItemPrice().subtract(billing.getBillingItemDiscount()));
            totalBalance = totalBalance.add(fee.getFeeTotal());
        }
        statementOfAccount.setFeesSummary(feesSummary);
        statementOfAccount.setTotalAmount(totalBalance);
        if (patientAdmission.getPatientStatus().contains("paid")) {
            statementOfAccount.setBalanceDue(new BigDecimal("0.00"));
        } else {
            statementOfAccount.setBalanceDue(totalBalance);
        }

        return ResponseEntity.ok(statementOfAccount);
    }

    // sa billing/accounting department manggagaling info dito
    @PostMapping(value="/philhealth", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addPhilHealthDiscount(@RequestBody PatientBilling model) {
        List errors = new ArrayList();
        errors.addAll(validate(model.getAdmissionID(), model));
        errors.addAll(validatePendingPayStatus(model.getAdmissionID()));
        errors.addAll(validatePhilHealthApproval(model.getAdmissionID()));
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }

        model.setBillingItemDetails(PHILHEALTH_DISCOUNT_DETAILS);
        return ResponseEntity.ok(patientBillingService.savePatientBilling(model));
    }

    // sa billing/accounting department manggagaling info dito
    @PostMapping(value="/hmo", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addHMODiscount(@RequestBody PatientBilling model) {
        List errors = new ArrayList();
        errors.addAll(validate(model.getAdmissionID(), model));
        errors.addAll(validatePendingPayStatus(model.getAdmissionID()));
        errors.addAll(validateHMOApproval(model.getAdmissionID()));
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }

        model.setBillingItemDetails(HMO_DISCOUNT_DETAILS);
        var result = patientBillingService.savePatientBilling(model);
        if (result != null) {
            var targetSupply = supplyService.getSupplyByName(model.getBillingItemDetails());
            boolean isSupplySupplyType = targetSupply.isPresent() && targetSupply.get().getSupplyType().contains("supply:");
            if (isSupplySupplyType) {
                Integer newSupplyQty = targetSupply.get().getSupplyQty() - model.getBillingItemQty();
                targetSupply.get().setSupplyQty(newSupplyQty);
                supplyService.updateSupply(targetSupply.get().getId(), targetSupply.get());
            }
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping(value="/billing/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updatePatientBilling(@PathVariable int id, @RequestBody PatientBilling model) {
        List errors = new ArrayList();
        errors.addAll(validate(model.getAdmissionID(), model));
        boolean toBeDeleted = model.getBillingItemQty() <= 0;
        boolean isUndeletable = UNDELETEABLE_DETAILS.contains(model.getBillingItemDetails());
        if (toBeDeleted && isUndeletable) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "invalid_input_error");
            error.put("message", "Cannot delete this billing item");
            error.put("target", "model");
            errors.add(error);
        }
        if (!toBeDeleted && model.getBillingItemQty() < 0) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "invalid_input_error");
            error.put("message", "Quantity must be greater than zero");
            error.put("target", "model");
            errors.add(error);
        }
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(errors);
        }


        var originalBilling = patientBillingService.getPatientBillingByAdmissionIDAndDetails(model.getAdmissionID(), model.getBillingItemDetails());
        var targetSupply = supplyService.getSupplyByName(model.getBillingItemDetails());
        boolean isSupplySupplyType = targetSupply.isPresent() && targetSupply.get().getSupplyType().contains("supply:");
        if (toBeDeleted) {
            patientBillingService.deletePatientBilling(id);
            // recover the supply qty if the billing item is a supply
            if (targetSupply.isPresent() && isSupplySupplyType) {
                Integer newSupplyQty = targetSupply.get().getSupplyQty() + originalBilling.get().getBillingItemQty();
                targetSupply.get().setSupplyQty(newSupplyQty);
                supplyService.updateSupply(targetSupply.get().getId(), targetSupply.get());
            }
            return ResponseEntity.ok("Deleted " + model.getBillingItemDetails() + " billing item.");
        }

        var result = patientBillingService.updatePatientBilling(id, model);
        if (result != null) {
            // if a Supply billing's qty is change, update the recovered or used amount of the supply
            boolean isBillingQtyChanged = originalBilling.isPresent() && originalBilling.get().getBillingItemQty() != model.getBillingItemQty();
            boolean isBillingQtyBigger = originalBilling.isPresent() && originalBilling.get().getBillingItemQty() < model.getBillingItemQty();
            Integer originalSupplyQty = targetSupply.get().getSupplyQty();
            if (isBillingQtyChanged && targetSupply.isPresent() && isSupplySupplyType && isBillingQtyBigger) {
                // if the billing qty is increased, deduct the used qty from the supply
                Integer newSupplyQty = originalSupplyQty - (model.getBillingItemQty() - originalBilling.get().getBillingItemQty());
                targetSupply.get().setSupplyQty(newSupplyQty);
                supplyService.updateSupply(targetSupply.get().getId(), targetSupply.get());
            } else if (isBillingQtyChanged && targetSupply.isPresent() && isSupplySupplyType && !isBillingQtyBigger) {
                // if the billing qty is decreased, add the recovered qty to the supply
                Integer newSupplyQty = originalSupplyQty + (originalBilling.get().getBillingItemQty() - model.getBillingItemQty());
                targetSupply.get().setSupplyQty(newSupplyQty);
                supplyService.updateSupply(targetSupply.get().getId(), targetSupply.get());
            }
        }

        return ResponseEntity.ok(result);
    }

    private void addSeniorOrPWDDiscount(int admissionID) {
        int patientID = patientAdmissionService.getPatientAdmissionById(admissionID).get().getPatientID();
        Patient patient = patientService.getPatientById(patientID).get();
        String seniorID = patient.getPatientSeniorID();
        String pwdID = patient.getPatientPWDID();

        boolean isEligibleForDiscount = (seniorID != null && !seniorID.isEmpty()) || (pwdID != null && !pwdID.isEmpty());
        if (!isEligibleForDiscount) {
            return;
        }

        List<PatientBilling> billings = patientBillingService.getAllPatientBillingByAdmissionID(admissionID);

        for(PatientBilling billing : billings) {
            if (!billing.getBillingItemDetails().contains("Discount") && billing.getBillingItemDiscount().signum() == 0) {
                // discount has not been applied yet
                BigDecimal discount = billing.getBillingItemPrice().multiply(PWD_SENIOR_DISCOUNT_RATE);
                billing.setBillingItemDiscount(discount);
                patientBillingService.updatePatientBilling(billing.getId(), billing);
            }
        }
    }

    private List validatePhilHealthApproval(Integer admissionID) {
        List errors = new ArrayList();
        boolean isPhilHealthApproved = patientsPhilHealthService.getPatientsPhilHealthByAdmissionID(admissionID).get().getPhilHealthStatus().equals("Approved");
        if (!isPhilHealthApproved) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "invalid_input_error");
            error.put("message", "PhilHealth is not yet approved for this patient");
            error.put("target", "admissionID");
            errors.add(error);
        }
        return errors;
    }

    private List validateHMOApproval(Integer admissionID) {
        List errors = new ArrayList();
        boolean isHMOApproved = patientsHMOService.getPatientsHMOByAdmissionID(admissionID).get().getHMOStatus().equals("Approved");
        if (!isHMOApproved) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "invalid_input_error");
            error.put("message", "HMO is not yet approved for this patient");
            error.put("target", "admissionID");
            errors.add(error);
        }
        return errors;
    }

    private List validate(Integer admissionID, PatientBilling model) {
        List errors = new ArrayList();

        if (model.getBillingItemDiscount().signum() < 0) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "invalid_input_error");
            error.put("message", "Discount amount must be greater than or equal to zero");
            error.put("target", "model");
            errors.add(error);
        }

        return errors;
    }

    private List validatePendingPayStatus(Integer admissionID) {
        List errors = new ArrayList();
        PatientAdmission patient = patientAdmissionService.getPatientAdmissionById(admissionID).get();
        boolean isPending = patient.getPatientStatus().contains("pending-pay");
        boolean isPaid = patient.getPatientStatus().contains("paid");
        boolean isCollateralized = patient.getPatientStatus().contains("collateralized");
        if (!(isPending || isCollateralized || isPaid)) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "invalid_input_error");
            error.put("message", "Patient is not pending for payment, paid, or collateralized");
            error.put("target", "admissionID");
            errors.add(error);
        }
        return errors;
    }

    private String generateRefID() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MMdd-HHmm");
        return LocalDateTime.now().format(formatter);
    }
}
