package aoop.quicker.model;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import javax.persistence.*;
import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "Supplies")
public class Supply {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "supplyID", nullable = false)
    private Integer id;

    @Nationalized
    @Lob
    @Column(name = "supplyName", nullable = false)
    private String supplyName;

    @Nationalized
    @Column(name = "supplyType", nullable = false, length = 50)
    private String supplyType;

    @Column(name = "supplyQty", nullable = false)
    private Integer supplyQty;

    @Column(name = "supplyPrice", precision = 19, scale = 4)
    private BigDecimal supplyPrice;

}