package aoop.quicker.model;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import javax.persistence.*;
import java.time.Instant;

@Entity
public class PatientsHMO {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "patientHMOID", nullable = false)
    private Integer id;

    @Column(name = "admissionID", nullable = false)
    private Integer admissionID;

    @Nationalized
    @Column(name = "HMOIDNum", nullable = false)
    private String hMOIDNum;

    @Nationalized
    @Column(name = "HMOEmployer", nullable = false)
    private String hMOEmployer;

    @Column(name = "HMOSignature", nullable = false)
    private byte[] hMOSignature;

    @Column(name = "HMORequestOn", nullable = false)
    private Instant hMORequestOn;

    @Nationalized
    @Column(name = "HMOStatus", nullable = false, length = 50)
    private String hMOStatus;

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

    public String gethMOIDNum() {
        return hMOIDNum;
    }

    public void sethMOIDNum(String hMOIDNum) {
        this.hMOIDNum = hMOIDNum;
    }

    public String gethMOEmployer() {
        return hMOEmployer;
    }

    public void sethMOEmployer(String hMOEmployer) {
        this.hMOEmployer = hMOEmployer;
    }

    public byte[] gethMOSignature() {
        return hMOSignature;
    }

    public void sethMOSignature(byte[] hMOSignature) {
        this.hMOSignature = hMOSignature;
    }

    public Instant gethMORequestOn() {
        return hMORequestOn;
    }

    public void sethMORequestOn(Instant hMORequestOn) {
        this.hMORequestOn = hMORequestOn;
    }

    public String gethMOStatus() {
        return hMOStatus;
    }

    public void sethMOStatus(String hMOStatus) {
        this.hMOStatus = hMOStatus;
    }
}