package aoop.quicker.config;

import aoop.quicker.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

/*
 * SecurityConfig
 * - to configure the security settings for the application
 * - Springboot Spring Security configuration
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    // Inject the custom user details service and is automatically managed by Springboot container
    @Autowired
    private CustomUserDetailsService userDetailsService;

    // Defines a bean for password encoder for secure password storage
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Defines a bean for authentication manager to be used in the application
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    // Configure the authentication manager with the custom user details service
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService)
                .passwordEncoder(new BCryptPasswordEncoder());
    }

    // Configure the HTTP security settings for the application
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .cors().and() // Ensure that CORS is enabled here
                .csrf().disable() // Disable CSRF since the app is only ran in LAN
                .authorizeRequests() // ensure that the following endpoints are protected
                .antMatchers("/",
                             "/index.html",
                            "/static/**",
                            "/login",
                            "/register",
                            "/auth/**",
                            "/me",
                            "/user/roles",
                            "/config.json").permitAll() // Allow these endpoints to be accessed without authentication
                .antMatchers("/admin/**").hasRole("ADMIN") // only allow admin to access these endpoints
                .antMatchers("/staff/**").hasAnyRole("STAFF", "ADMIN")// only allow staff and admin to access these endpoints
                .antMatchers("/inventory/**").hasAnyRole("INVENTORYSTAFF", "ADMIN")// only allow inventory staff and admin to access these endpoints
                .anyRequest().authenticated() // Protect the rest of endpoints
                .and()
                .formLogin() // Enable form login
                .loginPage("/") // Set the login page endpoint
                .permitAll() // Enable default login page
                .and()
                .logout() // Enable logout
                .logoutRequestMatcher(new AntPathRequestMatcher("/logout")) // Set the logout endpoint
                .logoutSuccessUrl("/")// Redirect to the login page after logout
                .permitAll(); // Enable default logout page
    }
}
