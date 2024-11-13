package aoop.quicker.service;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DatabaseConnectionLogger {
    @Bean
    public CommandLineRunner testDatabaseConnection(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("SELECT 1");
                System.out.println("Database connection is successful!");
            } catch (Exception e) {
                System.err.println("Failed to connect to the database: " + e.getMessage());
            }
        };
    }
}
