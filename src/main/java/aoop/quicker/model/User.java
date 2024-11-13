package aoop.quicker.model;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import javax.persistence.*;

@Getter
@Setter
@Entity
@Table(name = "Users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userID", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "userName", nullable = false)
    private String userName;

    @Nationalized
    @Column(name = "userRoles", nullable = false, length = 50)
    private String userRoles;

    @Nationalized
    @Column(name = "userPassword", nullable = false, length = 300)
    private String userPassword;

    @Nationalized
    @Column(name = "userSalt", nullable = false, length = 50)
    private String userSalt;
}