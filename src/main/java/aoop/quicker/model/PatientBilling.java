package aoop.quicker.model;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import javax.persistence.*;
import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "PatientBillings")
public class PatientBilling {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "patientBillingID", nullable = false)
    private Integer id;

    @Column(name = "admissionID", nullable = false)
    private Integer admissionID;

    @Nationalized
    @Column(name = "billingItemDetails", nullable = false)
    private String billingItemDetails;

    @Column(name = "billingItemPrice", nullable = false, precision = 19, scale = 4)
    private BigDecimal billingItemPrice;

    @Column(name = "billingItemQty", nullable = false)
    private Integer billingItemQty;

}