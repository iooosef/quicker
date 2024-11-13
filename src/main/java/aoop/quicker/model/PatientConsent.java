package aoop.quicker.model;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "PatientConsents")
public class PatientConsent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "consentID", nullable = false)
    private Integer id;

    @Column(name = "patientID", nullable = false)
    private Integer patientID;

    @Column(name = "consentSignedOn", nullable = false)
    private Instant consentSignedOn;

    @Column(name = "consentSignature", nullable = false)
    private byte[] consentSignature;

}