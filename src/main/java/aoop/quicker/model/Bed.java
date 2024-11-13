package aoop.quicker.model;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import javax.persistence.*;

@Getter
@Setter
@Entity
@Table(name = "Beds")
public class Bed {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bedID", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "bedLocCode", nullable = false, length = 50)
    private String bedLocCode;

    @Nationalized
    @Column(name = "bedStatus", nullable = false, length = 50)
    private String bedStatus;

}