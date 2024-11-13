package aoop.quicker.config;
import aoop.quicker.model.User;
import aoop.quicker.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = (BCryptPasswordEncoder) passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Check if the user table is empty
        if (userRepository.count() == 0) {
            // Create an admin user
            User adminUser = new User();
            adminUser.setUserName("admin");
            adminUser.setUserPassword(passwordEncoder.encode("admin1234"));
            adminUser.setUserRoles("ADMIN");  // Assigning a role

            // Save user to the database
            userRepository.save(adminUser);
            System.out.println("Admin user initialized");
        }
    }
}