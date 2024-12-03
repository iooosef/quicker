package aoop.quicker.model.viewmodel;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class StatementOfAccountViewModel {
    private int patientId;
    private String referenceNumber;
    private String patientName;
    private int patientAge;
    private String patientAddress;
    private String patientAdmissionCause;
    private boolean isSeniorCitizen;
    private boolean isPWD;
    private String philHealthIDNumber;
    private String hmoIDNumber;
    private Instant admissionDate;
    private Instant dischargeDate;
    private List<FeesSummaryViewModel> feesSummary;
    private BigDecimal totalAmount;

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    private BigDecimal balanceDue;
    private String status;

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getBalanceDue() {
        return balanceDue;
    }

    public void setBalanceDue(BigDecimal balanceDue) {
        this.balanceDue = balanceDue;
    }

    public List<FeesSummaryViewModel> getFeesSummary() {
        return feesSummary;
    }

    public void setFeesSummary(List<FeesSummaryViewModel> feesSummary) {
        this.feesSummary = feesSummary;
    }

    public Instant getDischargeDate() {
        return dischargeDate;
    }

    public void setDischargeDate(Instant dischargeDate) {
        this.dischargeDate = dischargeDate;
    }

    public Instant getAdmissionDate() {
        return admissionDate;
    }

    public void setAdmissionDate(Instant admissionDate) {
        this.admissionDate = admissionDate;
    }

    public String getHmoIDNumber() {
        return hmoIDNumber;
    }

    public void setHmoIDNumber(String hmoIDNumber) {
        this.hmoIDNumber = hmoIDNumber;
    }

    public String getPhilHealthIDNumber() {
        return philHealthIDNumber;
    }

    public void setPhilHealthIDNumber(String philHealthIDNumber) {
        this.philHealthIDNumber = philHealthIDNumber;
    }

    public boolean isPWD() {
        return isPWD;
    }

    public void setPWD(boolean PWD) {
        isPWD = PWD;
    }

    public boolean isSeniorCitizen() {
        return isSeniorCitizen;
    }

    public void setSeniorCitizen(boolean seniorCitizen) {
        isSeniorCitizen = seniorCitizen;
    }

    public String getPatientAdmissionCause() {
        return patientAdmissionCause;
    }

    public void setPatientAdmissionCause(String patientAdmissionCause) {
        this.patientAdmissionCause = patientAdmissionCause;
    }

    public String getPatientAddress() {
        return patientAddress;
    }

    public void setPatientAddress(String patientAddress) {
        this.patientAddress = patientAddress;
    }

    public int getPatientAge() {
        return patientAge;
    }

    public void setPatientAge(int patientAge) {
        this.patientAge = patientAge;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public int getPatientId() {
        return patientId;
    }

    public void setPatientId(int patientId) {
        this.patientId = patientId;
    }

    private String remarks;
}
