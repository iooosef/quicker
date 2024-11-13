package aoop.quicker.controller;

import aoop.quicker.model.User;
import aoop.quicker.service.CustomUserDetailsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/user")
public class UserController {
    Logger log = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @GetMapping("/roles")
    public String getRoles(Authentication authentication) {
        if (authentication != null) {
            var userName = authentication.getName();
            var userRoles = authentication.getAuthorities();
            return "User: " + userName + " has roles: " + userRoles;
        }
        return "User not logged-in";
    }
}
