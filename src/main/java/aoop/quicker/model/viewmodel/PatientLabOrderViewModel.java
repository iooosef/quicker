package aoop.quicker.model.viewmodel;

import java.math.BigDecimal;
import java.time.Instant;

public class PatientLabOrderViewModel {
    private Integer id;
    private Integer admissionID;
    private Integer supplyID;
    private String supplyName;
    private String supplyType;
    private Instant labOrderedOn;
    private String labResultStatus;

    public PatientLabOrderViewModel() {
    }

    public PatientLabOrderViewModel(Integer id, Integer admissionID, Integer supplyID, String supplyName, String supplyType, Instant labOrderedOn, String labResultStatus) {
        this.id = id;
        this.admissionID = admissionID;
        this.supplyID = supplyID;
        this.supplyName = supplyName;
        this.supplyType = supplyType;
        this.labOrderedOn = labOrderedOn;
        this.labResultStatus = labResultStatus;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getAdmissionID() {
        return admissionID;
    }

    public void setAdmissionID(Integer admissionID) {
        this.admissionID = admissionID;
    }

    public Integer getSupplyID() {
        return supplyID;
    }

    public void setSupplyID(Integer supplyID) {
        this.supplyID = supplyID;
    }

    public String getSupplyName() {
        return supplyName;
    }

    public void setSupplyName(String supplyName) {
        this.supplyName = supplyName;
    }

    public String getSupplyType() {
        return supplyType;
    }

    public void setSupplyType(String supplyType) {
        this.supplyType = supplyType;
    }
    
    public Instant getLabOrderedOn() {
        return labOrderedOn;
    }

    public void setLabOrderedOn(Instant labOrderedOn) {
        this.labOrderedOn = labOrderedOn;
    }

    public String getLabResultStatus() {
        return labResultStatus;
    }

    public void setLabResultStatus(String labResultStatus) {
        this.labResultStatus = labResultStatus;
    }
}
