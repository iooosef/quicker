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

/*
 * Patient Billing Controller
 *  - Handles patient billing operations
 *  - Spring Boot REST Controller
 */
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
    // Constants
    private final String PHILHEALTH_DISCOUNT_DETAILS = "PhilHealth Discount";
    private final String HMO_DISCOUNT_DETAILS = "HMO Discount";
    private final BigDecimal PWD_SENIOR_DISCOUNT_RATE = new BigDecimal("0.20"); // 20% discount rate
    // List of details that cannot be deleted
    private final ArrayList<String> UNDELETEABLE_DETAILS = new ArrayList<String>() {{
        add("Emergency Room Fee");
        add(PHILHEALTH_DISCOUNT_DETAILS);
        add(HMO_DISCOUNT_DETAILS);
    }};

    // Constructor for PatientBillingController
    // - allow dependency injection for PatientBillingService, SupplyService, PatientService, PatientAdmissionService, PatientsPhilHealthService, PatientsHMOService
    public PatientBillingController(PatientBillingService patientBillingService, SupplyService supplyService, PatientService patientService, PatientAdmissionService patientAdmissionService, PatientsPhilHealthService patientsPhilHealthService, PatientsHMOService patientsHMOService) {
        this.patientBillingService = patientBillingService;
        this.patientsHMOService = patientsHMOService;
        this.patientsPhilHealthService = patientsPhilHealthService;
        this.supplyService = supplyService;
        this.patientService = patientService;
        this.patientAdmissionService = patientAdmissionService;
    }

    // Handle the get request for all patient billing by admission ID
    @RequestMapping(value="/all/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<PatientBilling> getPatientBillingByAdmissionID(@PathVariable int id, @RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size); // Create a pageable object
        // Get all patient billing by admission ID
        Page<PatientBilling> patientBilling = patientBillingService.getAllPatientBillingByAdmissionID(id, pageable);
        log.info(patientBilling.toString());
        return patientBilling;
    }

    // Handle the get request for statement of account by admission ID
    @RequestMapping(value="/statement/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getStatementOfAccountByAdmissionID(@PathVariable int id) {
        List errors = new ArrayList();
        // validate to ensure status is pending-pay
        errors.addAll(validatePendingPayStatus(id));
        // validate if PhilHealth discount are added if it exist and approved
        boolean hasPhilHealth = patientsPhilHealthService.getPatientsPhilHealthByAdmissionID(id).isPresent();
        if (hasPhilHealth) {
            errors.addAll(validatePhilHealthApproval(id));
            // validate if PhilHealth discount are added to this patient's billling
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
        if (!errors.isEmpty()) { // return any/all errors
            return ResponseEntity.status(400).body(errors);
        }
        addSeniorOrPWDDiscount(id); // add senior or pwd discount if applicable

        // get patient admission by ID
        PatientAdmission patientAdmission = patientAdmissionService.getPatientAdmissionById(id).get();
        // get patient by ID
        Patient patient = patientService.getPatientById(patientAdmission.getPatientID()).get();
        StatementOfAccountViewModel statementOfAccount = new StatementOfAccountViewModel(); // create a new statement of account view model

        // set the statement of account view model properties
        statementOfAccount.setPatientId(patientAdmission.getPatientID()); // set patient ID
        statementOfAccount.setReferenceNumber(generateRefID() + "-" + patientAdmission.getPatientID()); // generate reference number
        statementOfAccount.setPatientName(patient.getPatientFullName()); // set patient name
        statementOfAccount.setPatientAge(patientService.getPatientAgeById(patientAdmission.getPatientID())); // set patient age
        statementOfAccount.setPatientAddress(patient.getPatientAddress()); // set patient address
        statementOfAccount.setPatientAdmissionCause(patientAdmission.getPatientERCause()); // set patient admission cause
        statementOfAccount.setPWD(!patient.getPatientPWDID().isEmpty()); // check if patient is pwd
        statementOfAccount.setSeniorCitizen(!patient.getPatientSeniorID().isEmpty()); // check if patient is senior citizen

        // get philhealth and hmo by admission ID
        PatientsPhilHealth philHealth = patientsPhilHealthService.getPatientsPhilHealthByAdmissionID(id).get();
        statementOfAccount.setPhilHealthIDNumber(philHealth.getPhilHealthIDNum()); // set philhealth ID number
        PatientsHMO hmo = patientsHMOService.getPatientsHMOByAdmissionID(id).get(); // set hmo ID number

        statementOfAccount.setHmoIDNumber(hmo.gethMOIDNum()); // set hmo ID number
        statementOfAccount.setStatus(patientAdmission.getPatientStatus()); // set patient status

        List<FeesSummaryViewModel> feesSummary = new ArrayList<>(); // create a new list of fees summary view model
        // get all patient billing by admission ID
        List<PatientBilling> billings = patientBillingService.getAllPatientBillingByAdmissionID(id);
        BigDecimal totalBalance = new BigDecimal("0.00"); // set total balance to 0
        // loop through all billings
        for (PatientBilling billing : billings) {
            // create a new fees summary view model
            FeesSummaryViewModel fee = new FeesSummaryViewModel();
            fee.setFeeDetails(billing.getBillingItemDetails());
            fee.setFeeCharge(billing.getBillingItemPrice());
            fee.setFeeDiscount(billing.getBillingItemDiscount());
            // set fee total to the difference of fee charge and fee discount
            fee.setFeeTotal(billing.getBillingItemPrice().subtract(billing.getBillingItemDiscount()));
            totalBalance = totalBalance.add(fee.getFeeTotal()); // add fee total to total balance
        }
        statementOfAccount.setFeesSummary(feesSummary); // set fees summary
        statementOfAccount.setTotalAmount(totalBalance); // set total amount
        if (patientAdmission.getPatientStatus().contains("paid")) {
            // set balance due to 0 if patient status is paid
            statementOfAccount.setBalanceDue(new BigDecimal("0.00"));
        } else {
            // set balance due to total balance
            statementOfAccount.setBalanceDue(totalBalance);
        }

        return ResponseEntity.ok(statementOfAccount);
    }

    // sa billing/accounting department manggagaling info dito
    // Handle the post request for PhilHealth discount
    @PostMapping(value="/philhealth", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addPhilHealthDiscount(@RequestBody PatientBilling model) {
        List errors = new ArrayList();
        // validate to ensure status is pending-pay
        errors.addAll(validate(model.getAdmissionID(), model));
        // validate if PhilHealth discount are added if it exist and approved
        errors.addAll(validatePendingPayStatus(model.getAdmissionID()));
        // validate if PhilHealth discount are added to this patient's billling
        errors.addAll(validatePhilHealthApproval(model.getAdmissionID()));
        if (!errors.isEmpty()) { // return any/all errors
            return ResponseEntity.status(400).body(errors);
        }

        model.setBillingItemDetails(PHILHEALTH_DISCOUNT_DETAILS); // set billing item details to PhilHealth discount
        return ResponseEntity.ok(patientBillingService.savePatientBilling(model)); // save patient billing
    }

    // sa billing/accounting department manggagaling info dito
    // Handle the post request for HMO discount
    @PostMapping(value="/hmo", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addHMODiscount(@RequestBody PatientBilling model) {
        List errors = new ArrayList();
        errors.addAll(validate(model.getAdmissionID(), model)); // validate model
        errors.addAll(validatePendingPayStatus(model.getAdmissionID())); // validate pending pay status
        errors.addAll(validateHMOApproval(model.getAdmissionID())); // validate HMO approval
        if (!errors.isEmpty()) { // return any/all errors
            return ResponseEntity.status(400).body(errors);
        }

        model.setBillingItemDetails(HMO_DISCOUNT_DETAILS); // set billing item details to HMO discount
        var result = patientBillingService.savePatientBilling(model);
        if (result != null) {
            // get all patient billing by admission ID
            var targetSupply = supplyService.getSupplyByName(model.getBillingItemDetails());
            boolean isSupplySupplyType = targetSupply.isPresent() && targetSupply.get().getSupplyType().contains("supply:");
            if (isSupplySupplyType) { // if supply is supply type
                // deduct the supply quantity
                Integer newSupplyQty = targetSupply.get().getSupplyQty() - model.getBillingItemQty();
                targetSupply.get().setSupplyQty(newSupplyQty);
                supplyService.updateSupply(targetSupply.get().getId(), targetSupply.get());
            }
        }
        return ResponseEntity.ok(result);
    }

    // Handle the post request for adding patient billing
    @PostMapping(value="/billing", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addPatientBilling(@RequestBody PatientBilling model) {
        List errors = new ArrayList();
        errors.addAll(validate(model.getAdmissionID(), model)); // validate model
        if (!errors.isEmpty()) { // return any/all errors
            return ResponseEntity.status(400).body(errors);
        }

        // Handle the updating of supply quantity when it is added to billing
        var targetSupply = supplyService.getSupplyById(Integer.parseInt(model.getBillingItemDetails())); // details from client are supply id
        boolean isSupplySupplyType = targetSupply.isPresent() && targetSupply.get().getSupplyType().contains("supply:");
        if (isSupplySupplyType) { // if supply is supply type
            // deduct the supply quantity
            Integer newSupplyQty = targetSupply.get().getSupplyQty() - model.getBillingItemQty();
            if (newSupplyQty < 0) {
                // return error if supply quantity is insufficient
                HashMap<String, String> error = new HashMap<>();
                error.put("type", "invalid_input_error");
                error.put("message", "Insufficient supply quantity.");
                error.put("target", "billingItemQty");
                return ResponseEntity.status(400).body(List.of(error));
            }
            targetSupply.get().setSupplyQty(newSupplyQty);
            supplyService.updateSupply(targetSupply.get().getId(), targetSupply.get()); // update supply
        }
        model.setBillingItemDetails(targetSupply.get().getSupplyName());
        model.setBillingItemPrice(targetSupply.get().getSupplyPrice());
        return ResponseEntity.ok(patientBillingService.savePatientBilling(model)); // save patient billing
    }

    // Handle the put request for updating patient billing
    @PutMapping(value="/billing/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updatePatientBilling(@PathVariable int id, @RequestBody PatientBilling model) {
        List errors = new ArrayList();
        errors.addAll(validate(model.getAdmissionID(), model));

        // Handle validation if the billing item is deletable
        var originalBilling = patientBillingService.getPatientBillingByAdmissionIDAndDetails(model.getAdmissionID(), model.getBillingItemDetails());
        var targetSupply = supplyService.getSupplyByName(model.getBillingItemDetails());
        boolean isSupplySupplyType = targetSupply.isPresent() && targetSupply.get().getSupplyType().contains("supply:");
        boolean toBeDeleted = model.getBillingItemQty() <= 0; // set a flag if the billing item is to be deleted
        boolean isUndeletable = UNDELETEABLE_DETAILS.contains(model.getBillingItemDetails());
        if (toBeDeleted && isUndeletable) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "invalid_input_error");
            error.put("message", "Cannot delete this billing item");
            error.put("target", "model");
            errors.add(error);
        }
        // Handle validation if the billing item is supply type and quantity is less than zero
        if (isSupplySupplyType && !toBeDeleted && model.getBillingItemQty() < 0) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "invalid_input_error");
            error.put("message", "Quantity must be greater than zero");
            error.put("target", "billingItemQty");
            errors.add(error);
        }
        if (!errors.isEmpty()) { // return any/all errors
            return ResponseEntity.status(400).body(errors);
        }

        if (toBeDeleted) {
            // delete the billing item if it is to be deleted
            patientBillingService.deletePatientBilling(id);
            // recover the supply qty if the billing item is a supply
            if (targetSupply.isPresent() && isSupplySupplyType) {
                Integer newSupplyQty = targetSupply.get().getSupplyQty() + originalBilling.get().getBillingItemQty();
                targetSupply.get().setSupplyQty(newSupplyQty);
                supplyService.updateSupply(targetSupply.get().getId(), targetSupply.get());
            }
            return ResponseEntity.ok("Deleted " + model.getBillingItemDetails() + " billing item.");
        }

        // Handle the updating of supply quantity when it is added to billing
        boolean isBillingQtyChanged = originalBilling.isPresent() && originalBilling.get().getBillingItemQty() != model.getBillingItemQty();
        boolean isBillingQtyBigger = originalBilling.isPresent() && originalBilling.get().getBillingItemQty() < model.getBillingItemQty();
        Integer originalSupplyQty = targetSupply.get().getSupplyQty();
        // if the billing qty is changed and the billing item is a supply
        if (isBillingQtyChanged && targetSupply.isPresent() && isSupplySupplyType) {
            int newSupplyQty;
            if (isBillingQtyBigger) {
                // if the billing qty is increased, deduct the used qty from the supply
                newSupplyQty = originalSupplyQty - (model.getBillingItemQty() - originalBilling.get().getBillingItemQty());
            } else {
                // if the billing qty is decreased, add the recovered qty to the supply
                newSupplyQty = originalSupplyQty + (originalBilling.get().getBillingItemQty() - model.getBillingItemQty());
            }
            // Ensure the supply qty does not go negative
            if (newSupplyQty < 0) {
                HashMap<String, String> error = new HashMap<>();
                error.put("type", "invalid_input_error");
                error.put("message", "Insufficient supply quantity.");
                error.put("target", "model");
                errors.add(error);
                return ResponseEntity.status(400).body(errors);
            }
            targetSupply.get().setSupplyQty(newSupplyQty);
        }

        // Update the patient billing
        var result = patientBillingService.updatePatientBilling(id, model);
        if (result != null) {
            // Update the supply qty if the billing item is a supply
            supplyService.updateSupply(targetSupply.get().getId(), targetSupply.get());
        }

        return ResponseEntity.ok(result);
    }

    // Helper function to add senior or pwd discount
    private void addSeniorOrPWDDiscount(int admissionID) {
        int patientID = patientAdmissionService.getPatientAdmissionById(admissionID).get().getPatientID();
        Patient patient = patientService.getPatientById(patientID).get();
        String seniorID = patient.getPatientSeniorID(); // get senior ID
        String pwdID = patient.getPatientPWDID(); // get pwd ID

        // Check if patient is eligible for discount
        // aka has senior ID or pwd ID
        boolean isEligibleForDiscount = (seniorID != null && !seniorID.isEmpty()) || (pwdID != null && !pwdID.isEmpty());
        if (!isEligibleForDiscount) {
            return; // guard clause if patient is not eligible for discount
        }

        List<PatientBilling> billings = patientBillingService.getAllPatientBillingByAdmissionID(admissionID);
        // for all billing items, if it is not a discount and discount has not been applied yet
        // apply the discount to the billing item
        for(PatientBilling billing : billings) {
            if (!billing.getBillingItemDetails().contains("Discount") && billing.getBillingItemDiscount().signum() == 0) {
                // discount has not been applied yet
                BigDecimal discount = billing.getBillingItemPrice().multiply(PWD_SENIOR_DISCOUNT_RATE);
                billing.setBillingItemDiscount(discount);
                patientBillingService.updatePatientBilling(billing.getId(), billing);
            }
        }
    }

    // Helper function to validate PhilHealth approval
    private List validatePhilHealthApproval(Integer admissionID) {
        List errors = new ArrayList();
        boolean isPhilHealthApproved = patientsPhilHealthService.getPatientsPhilHealthByAdmissionID(admissionID).get().getPhilHealthStatus().equals("Approved");
        // if PhilHealth is not approved, return an error
        if (!isPhilHealthApproved) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "invalid_input_error");
            error.put("message", "PhilHealth is not yet approved for this patient");
            error.put("target", "admissionID");
            errors.add(error);
        }
        return errors;
    }

    // Helper function to validate HMO approval
    private List validateHMOApproval(Integer admissionID) {
        List errors = new ArrayList();
        boolean isHMOApproved = patientsHMOService.getPatientsHMOByAdmissionID(admissionID).get().gethMOStatus().equals("Approved");
        // if HMO is not approved, return an error
        if (!isHMOApproved) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "invalid_input_error");
            error.put("message", "HMO is not yet approved for this patient");
            error.put("target", "admissionID");
            errors.add(error);
        }
        return errors;
    }

    // Helper function to validate model
    private List validate(Integer admissionID, PatientBilling model) {
        List errors = new ArrayList();
        // if billing item price is less than zero, return an error
        if (model.getBillingItemDiscount().signum() < 0) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "invalid_input_error");
            error.put("message", "Discount amount must be greater than or equal to zero");
            error.put("target", "model");
            errors.add(error);
        }

        return errors;
    }

    // Helper function to validate pending pay status
    private List validatePendingPayStatus(Integer admissionID) {
        List errors = new ArrayList();
        PatientAdmission patient = patientAdmissionService.getPatientAdmissionById(admissionID).get();
        boolean isPending = patient.getPatientStatus().contains("pending-pay");
        boolean isPaid = patient.getPatientStatus().contains("paid");
        boolean isCollateralized = patient.getPatientStatus().contains("collateralized");
        // if patient is not pending for payment, paid, or collateralized, return an error
        if (!(isPending || isCollateralized || isPaid)) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "invalid_input_error");
            error.put("message", "Patient is not pending for payment, paid, or collateralized");
            error.put("target", "admissionID");
            errors.add(error);
        }
        return errors;
    }

    // Helper function to generate reference ID
    private String generateRefID() {
        // generate reference ID based on current date and time
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MMdd-HHmm");
        return LocalDateTime.now().format(formatter);
    }
}
