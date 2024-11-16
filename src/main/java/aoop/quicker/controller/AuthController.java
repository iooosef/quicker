package aoop.quicker.controller;

import aoop.quicker.model.User;
import aoop.quicker.model.viewmodel.AuthViewModel;
import aoop.quicker.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
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

    @RequestMapping("/login")
    public ResponseEntity<String> authenticateUser(@RequestBody AuthViewModel model) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            model.getUserName(),
                            model.getUserPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            return new ResponseEntity<>("User logged-in", HttpStatus.OK);

        } catch (BadCredentialsException e) {
            return new ResponseEntity<>("Invalid username or password", HttpStatus.UNAUTHORIZED);
        } catch (AuthenticationException e) {
            return new ResponseEntity<>("Authentication failed", HttpStatus.UNAUTHORIZED);
        }
    }

    @RequestMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody AuthViewModel model) {
        logger.info(model.toString());
        boolean userExist = userRepository.findByUserName(model.getUserName()).isPresent();
        if (userExist) {
            return new ResponseEntity<>("User already exists", HttpStatus.BAD_REQUEST);
        }

        User user = new User();
        user.setUserName(model.getUserName());
        user.setUserPassword(passwordEncoder.encode(model.getUserPassword()));
        user.setUserRoles(model.getUserRoles());

        userRepository.save(user);
        return new ResponseEntity<>(String.format("User \"%s\" has been registered", user.getUserName()), HttpStatus.CREATED);
    }
}
