package aoop.quicker.model;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import javax.persistence.*;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "Patients")
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "patientID", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "patientName", nullable = false)
    private String patientName;

    @Column(name = "patientTriage", nullable = false)
    private Integer patientTriage;

    @Nationalized
    @Column(name = "patientStatus", nullable = false, length = 50)
    private String patientStatus;

    @Nationalized
    @Column(name = "patientBedLocCode", nullable = false, length = 50)
    private String patientBedLocCode;

    @Column(name = "patientAddedOn", nullable = false)
    private Instant patientAddedOn;

}