package aoop.quicker.model;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import javax.persistence.*;
import java.time.Instant;

@Getter
@Setter
@Entity
public class PatientsPhilHealth {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "patientPhilHealthID", nullable = false)
    private Integer id;

    @Column(name = "patientID", nullable = false)
    private Integer patientID;

    @Nationalized
    @Column(name = "philHealthIDNum", nullable = false)
    private String philHealthIDNum;

    @Nationalized
    @Column(name = "philHealthEmployer", nullable = false)
    private String philHealthEmployer;

    @Column(name = "philHealthSignature", nullable = false)
    private byte[] philHealthSignature;

    @Column(name = "philHealthRequestOn", nullable = false)
    private Instant philHealthRequestOn;

    @Nationalized
    @Column(name = "philHealthStatus", nullable = false, length = 50)
    private String philHealthStatus;

}