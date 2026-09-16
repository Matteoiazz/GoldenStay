package it.unical.webapp.angulargoldenstaybackend.controller;

import it.unical.webapp.angulargoldenstaybackend.model.User;
import it.unical.webapp.angulargoldenstaybackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // 1. REGISTRAZIONE
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        String email = normalize(user.getEmail());

        if (email.isEmpty() || user.getPassword() == null || user.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email e password sono obbligatorie"));
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email già registrata"));
        }

        user.setEmail(email);
        // Il ruolo non arriva mai dal client: ogni nuovo account nasce come ospite.
        user.setRole(User.ROLE_USER);

        return ResponseEntity.ok(userRepository.save(user));
    }

    // 2. LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User credentials) {
        return userRepository
                .findByEmailAndPassword(normalize(credentials.getEmail()), credentials.getPassword())
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("error", "Credenziali errate")));
    }

    private String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
