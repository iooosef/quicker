package aoop.quicker.model;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import javax.persistence.*;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "PatientLabOrders")
public class PatientLabOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "patientLabsID", nullable = false)
    private Integer id;

    @Column(name = "admissionID", nullable = false)
    private Integer admissionID;

    @Column(name = "supplyID", nullable = false)
    private Integer supplyID;

    @Column(name = "labOrderedOn", nullable = false)
    private Instant labOrderedOn;

    @Nationalized
    @Column(name = "labResultStatus", nullable = false, length = 50)
    private String labResultStatus;

}