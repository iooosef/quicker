package aoop.quicker.model;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import javax.persistence.*;
import java.time.Instant;

@Getter
@Setter
@Entity
public class PatientsHMO {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "patientHMOID", nullable = false)
    private Integer id;

    @Column(name = "patientID", nullable = false)
    private Integer patientID;

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

}