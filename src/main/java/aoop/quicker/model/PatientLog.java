package aoop.quicker.model;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import javax.persistence.*;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "PatientLogs")
public class PatientLog {
    @Id
    @Column(name = "patientLogID", nullable = false)
    private Integer id;

    @Column(name = "patientID", nullable = false)
    private Integer patientID;

    @Nationalized
    @Lob
    @Column(name = "patientLogMsg", nullable = false)
    private String patientLogMsg;

    @Nationalized
    @Column(name = "patientLogBy", nullable = false)
    private String patientLogBy;

    @Column(name = "patientLogOn", nullable = false)
    private Instant patientLogOn;

}