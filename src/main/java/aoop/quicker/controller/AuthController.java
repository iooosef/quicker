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

import java.util.HashMap;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private AuthenticationManager authenticationManager;
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private Logger logger = LoggerFactory.getLogger(AuthController.class);

    public AuthController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @RequestMapping(value="/login", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<HashMap<String, String>> authenticateUser(@RequestBody AuthViewModel model) {
        HashMap<String, String> response = new HashMap<>();
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            model.getUserName(),
                            model.getUserPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            response.put("message", "User logged-in");
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (BadCredentialsException e) {
            response.put("message", "Invalid username or password");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        } catch (AuthenticationException e) {
            response.put("message", "Authentication failed");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
    }

    @RequestMapping(value="/register", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<HashMap<String, String>> registerUser(@RequestBody AuthViewModel model) {
        HashMap<String, String> response = new HashMap<>();
        boolean userExist = userRepository.findByUserName(model.getUserName()).isPresent();
        if (userExist) {
            response.put("message", "User already exists");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        User user = new User();
        user.setUserName(model.getUserName());
        user.setUserPassword(passwordEncoder.encode(model.getUserPassword()));
        user.setUserRoles(model.getUserRoles());

        userRepository.save(user);
        response.put("message", String.format("User \"%s\" has been registered", user.getUserName()));
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}