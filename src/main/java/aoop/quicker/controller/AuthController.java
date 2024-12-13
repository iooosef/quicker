package aoop.quicker.controller;

import aoop.quicker.model.User;
import aoop.quicker.model.viewmodel.AuthViewModel;
import aoop.quicker.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
/*
    * AuthController
    * - to handle the authentication and authorization of the application
    * - Springboot REST controller
 */
@RestController
@RequestMapping("/auth") // Define the base path for the controller
public class AuthController {
    private AuthenticationManager authenticationManager;
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;

    // Constructor for the AuthController
    // - allow dependency injection of the authentication manager, user repository, and password encoder
    public AuthController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Handle the login request
    @RequestMapping(value="/login", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> authenticateUser(@RequestBody AuthViewModel model) {
        HashMap<String, String> response = new HashMap<>();
        List errors = new ArrayList();

        try {
            // Authenticate the user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            model.getUserName(),
                            model.getUserPassword()
                    )
            );

            // Set the authentication context
            SecurityContextHolder.getContext().setAuthentication(authentication); // set the authentication context
            String role = authentication.getAuthorities().stream().findFirst().get().getAuthority(); // get the first role in collection of roles
            String loginDatetime = java.time.LocalDateTime.now().toString(); // get current datetime
            // build the response
            response.put("username", model.getUserName());
            response.put("role", role);
            response.put("loginDatetime", loginDatetime);

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (BadCredentialsException e) {
            // Handle the bad credentials exception
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "authentication_error");
            error.put("message", "Invalid username or password");
            error.put("target", "model");
            errors.add(error);
        } catch (AuthenticationException e) {
            // Handle the authentication exception
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "authentication_error");
            error.put("message", "Authentication failed");
            error.put("target", "model");
        }
        return new ResponseEntity<>(Collections.singletonMap("errors", errors), HttpStatus.UNAUTHORIZED);
    }

    // Handle the registration request
    @RequestMapping(value="/register", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> registerUser(@RequestBody AuthViewModel model) {
        HashMap<String, String> response = new HashMap<>();
        List errors = new ArrayList();
        boolean userExist = userRepository.findByUserName(model.getUserName()).isPresent(); // Check if the user already exists
        if (userExist) {
            // Handle the user already exists error
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "User already exists");
            error.put("target", "userName");
            errors.add(error);
            return new ResponseEntity<>(Collections.singletonMap("errors", errors), HttpStatus.BAD_REQUEST);
        }

        User user = new User();
        user.setUserName(model.getUserName());
        user.setUserPassword(passwordEncoder.encode(model.getUserPassword())); // Encrypt the password
        user.setUserRoles(model.getUserRoles());

        userRepository.save(user); // Save the user to the database
        // Build the response
        response.put("userName", user.getUserName());
        response.put("userRoles", user.getUserRoles());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
