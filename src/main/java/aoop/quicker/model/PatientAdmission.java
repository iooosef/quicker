package aoop.quicker.model;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import javax.persistence.*;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "PatientAdmissions")
public class PatientAdmission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "admissionID", nullable = false)
    private Integer id;

    @Column(name = "patientID")
    private Integer patientID;

    @Nationalized
    @Column(name = "patientName", nullable = false)
    private String patientName;

    @Column(name = "patientTriage", nullable = false)
    private Integer patientTriage;

    @Nationalized
    @Column(name = "patientStatus", nullable = false, length = 50)
    private String patientStatus;

    @Nationalized
    @Column(name = "patientBillingStatus", nullable = false, length = 20)
    private String patientBillingStatus = "unpaid";

    @Nationalized
    @Column(name = "patientBedLocCode", nullable = false, length = 50)
    private String patientBedLocCode;

    @Column(name = "patientAdmitOn", nullable = false)
    private Instant patientAdmitOn;

    @Column(name = "patientOutOn")
    private Instant patientOutOn;

    @Nationalized
    @Lob
    @Column(name = "patientERCause", nullable = false)
    private String patientERCause;

}