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
    public ResponseEntity<?> authenticateUser(@RequestBody AuthViewModel model) {
        HashMap<String, String> response = new HashMap<>();
        List errors = new ArrayList();

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            model.getUserName(),
                            model.getUserPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String role = authentication.getAuthorities().stream().findFirst().get().getAuthority();
            String loginDatetime = java.time.LocalDateTime.now().toString();
            response.put("username", model.getUserName());
            response.put("role", role);
            response.put("loginDatetime", loginDatetime);

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (BadCredentialsException e) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "authentication_error");
            error.put("message", "Invalid username or password");
            error.put("target", "model");
            errors.add(error);
        } catch (AuthenticationException e) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "authentication_error");
            error.put("message", "Authentication failed");
            error.put("target", "model");
        }
        return new ResponseEntity<>(Collections.singletonMap("errors", errors), HttpStatus.UNAUTHORIZED);
    }


    @RequestMapping(value="/register", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> registerUser(@RequestBody AuthViewModel model) {
        HashMap<String, String> response = new HashMap<>();
        List errors = new ArrayList();
        boolean userExist = userRepository.findByUserName(model.getUserName()).isPresent();
        if (userExist) {
            HashMap<String, String> error = new HashMap<>();
            error.put("type", "validation_error");
            error.put("message", "User already exists");
            error.put("target", "userName");
            errors.add(error);
            return new ResponseEntity<>(Collections.singletonMap("errors", errors), HttpStatus.BAD_REQUEST);
        }

        User user = new User();
        user.setUserName(model.getUserName());
        user.setUserPassword(passwordEncoder.encode(model.getUserPassword()));
        user.setUserRoles(model.getUserRoles());

        userRepository.save(user);
        response.put("userName", user.getUserName());
        response.put("userRoles", user.getUserRoles());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
