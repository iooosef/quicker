package aoop.quicker.model;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "PatientTreatmentOrders")
public class PatientTreatmentOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "patientTreatmentsID", nullable = false)
    private Integer id;

    @Column(name = "admissionID", nullable = false)
    private Integer admissionID;

    @Column(name = "supplyID", nullable = false)
    private Integer supplyID;

    @Column(name = "treatmentOrderedOn", nullable = false)
    private Instant treatmentOrderedOn;

}