package aoop.quicker.controller;

import aoop.quicker.model.User;
import aoop.quicker.service.CustomUserDetailsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@RestController
public class HomeController {
    private final CustomUserDetailsService userDetailsService;

    public HomeController(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @GetMapping
    public String home() {
        return "Welcome to Quicker!";
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication authentication) {
        if(authentication != null) {
            User user = new User();
            user.setUserName(authentication.getName());
            user.setUserRoles(authentication.getAuthorities().toString());
            return ResponseEntity.ok(user);
        }

        List errors = new ArrayList<>();
        HashMap<String, String> error = new HashMap<>();
        error.put("type", "authentication_error");
        error.put("message", "User not authenticated");
        error.put("target", "model");
        errors.add(error);
        return ResponseEntity.status(401).body(errors);
    }
}
