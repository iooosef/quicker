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

@Controller
@CrossOrigin(origins = "http://localhost:5173")
public class HomeController {
    private final CustomUserDetailsService userDetailsService;

    public HomeController(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @GetMapping("/{path:[^\\.]*}")
    public String forward() {
        return "forward:/index.html";
    }

    @GetMapping({"/", "/login", "/register"})
    public String home() {
        return "forward:/index.html";
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
