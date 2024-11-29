package aoop.quicker.model.viewmodel;

import java.time.Instant;

public class PatientTreatmentOrderViewModel {
    private Integer id;
    private Integer admissionID;
    private Integer supplyID;
    private String supplyName;
    private Instant treatmentOrderedOn;

    public PatientTreatmentOrderViewModel() {
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

    public Instant getTreatmentOrderedOn() {
        return treatmentOrderedOn;
    }

    public void setTreatmentOrderedOn(Instant treatmentOrderedOn) {
        this.treatmentOrderedOn = treatmentOrderedOn;
    }
}
