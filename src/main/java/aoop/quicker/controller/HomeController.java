package aoop.quicker.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {
    @GetMapping
    public String home() {
        return "Welcome to Quicker!";
    }

    @GetMapping("/admin")
    public String admin() {
        return "Welcome Admin!";
    }
}
