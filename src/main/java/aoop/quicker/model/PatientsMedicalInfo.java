package aoop.quicker.model;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import javax.persistence.*;

@Getter
@Setter
@Entity
public class PatientsMedicalInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "patientMedNfoID", nullable = false)
    private Integer id;

    @Column(name = "patientID", nullable = false)
    private Integer patientID;

    @Column(name = "patientMedNfoHeight", nullable = false)
    private Double patientMedNfoHeight;

    @Column(name = "patientMedNfoWeight", nullable = false)
    private Double patientMedNfoWeight;

    @Nationalized
    @Lob
    @Column(name = "patientMedNfoAllergies", nullable = true)
    private String patientMedNfoAllergies;

    @Nationalized
    @Lob
    @Column(name = "patientMedNfoMedications", nullable = true)
    private String patientMedNfoMedications;

    @Nationalized
    @Lob
    @Column(name = "patientMedNfoComorbidities", nullable = true)
    private String patientMedNfoComorbidities;

    @Nationalized
    @Lob
    @Column(name = "patientMedNfoHistory", nullable = true)
    private String patientMedNfoHistory;

    @Nationalized
    @Lob
    @Column(name = "patientMedNfoImmunization", nullable = true)
    private String patientMedNfoImmunization;

    @Nationalized
    @Lob
    @Column(name = "patientMedNfoFamilyHistory", nullable = true)
    private String patientMedNfoFamilyHistory;

    @Nationalized
    @Lob
    @Column(name = "patientMedNfoCOVIDVaxx", nullable = true)
    private String patientMedNfoCOVIDVaxx;

}