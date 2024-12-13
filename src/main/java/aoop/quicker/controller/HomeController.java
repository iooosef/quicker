package aoop.quicker.controller;

import aoop.quicker.model.User;
import aoop.quicker.service.CustomUserDetailsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/*
    * HomeController
    * - to handle the home page and user authentication
    * - Springboot REST controller
 */
@Controller
@CrossOrigin(origins = "http://localhost:5173")
public class HomeController {
    private final CustomUserDetailsService userDetailsService;

    // Constructor for the HomeController
    // - allow dependency injection of the custom user details service
    public HomeController(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    // Forward all requests to the index.html
    @GetMapping("/{path:[^\\.]*}")
    public String forward() {
        return "forward:/index.html";
    }

    // Handle the home page request
    @GetMapping({"/", "/login", "/register"})
    public String home() {
        return "forward:/index.html";
    }

    // Handle the user authentication request
    // Pass the currently authenticated user as parameter
    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication authentication) {
        // If the user is authenticated, return the user details
        if(authentication != null) {
            User user = new User();
            user.setUserName(authentication.getName());
            user.setUserRoles(authentication.getAuthorities().toString()); // Get the user roles
            return ResponseEntity.ok(user);
        }

        // If the user is not authenticated, return an error message with status code 401 (Unauthorized)
        List errors = new ArrayList<>();
        HashMap<String, String> error = new HashMap<>();
        error.put("type", "authentication_error");
        error.put("message", "User not authenticated");
        error.put("target", "model");
        errors.add(error);
        return ResponseEntity.status(401).body(errors);
    }
}
