package aoop.quicker.model;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import javax.persistence.*;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "PatientDetails")
public class PatientDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "patientNfoID", nullable = false)
    private Integer id;

    @Column(name = "patientID", nullable = false)
    private Integer patientID;

    @Nationalized
    @Lob
    @Column(name = "patientFullName", nullable = false)
    private String patientFullName;

    @Nationalized
    @Column(name = "patientGender", nullable = false, length = 20)
    private String patientGender;

    @Column(name = "patientDOB", nullable = false)
    private Instant patientDOB;

    @Nationalized
    @Lob
    @Column(name = "patientAddress", nullable = false)
    private String patientAddress;

    @Nationalized
    @Column(name = "patientContactNum", nullable = false, length = 30)
    private String patientContactNum;

    @Nationalized
    @Lob
    @Column(name = "patientEmergencyContactName", nullable = false)
    private String patientEmergencyContactName;

    @Nationalized
    @Column(name = "patientEmergencyContactNumber", nullable = false, length = 30)
    private String patientEmergencyContactNumber;

    @Nationalized
    @Column(name = "patientPWDID", length = 60)
    private String patientPWDID;

    @Nationalized
    @Column(name = "patientSeniorID", length = 60)
    private String patientSeniorID;

}