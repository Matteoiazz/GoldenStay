package it.unical.webapp.angulargoldenstaybackend;

import it.unical.webapp.angulargoldenstaybackend.model.Room;
import it.unical.webapp.angulargoldenstaybackend.model.User; // Import necessario
import it.unical.webapp.angulargoldenstaybackend.repository.RoomRepository;
import it.unical.webapp.angulargoldenstaybackend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DBLoader implements CommandLineRunner {

    private static final String IMG = "https://images.unsplash.com/";
    private static final String FIT = "?auto=format&fit=crop&w=1200&q=80";

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public DBLoader(RoomRepository roomRepository, UserRepository userRepository) {
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {

        // 1. Inserimento Stanze
        if (roomRepository.count() == 0) {
            roomRepository.save(new Room("Suite Vista Mare",
                    "Vista mozzafiato sul golfo, letto king size e bagno in pietra locale.",
                    250.00, IMG + "photo-1571003123894-1f0594d2b5d9" + FIT, 2));
            roomRepository.save(new Room("Camera Deluxe",
                    "Spaziosa e moderna, con balcone privato affacciato sul lungomare.",
                    180.00, IMG + "photo-1611892440504-42a792e24d32" + FIT, 3));
            roomRepository.save(new Room("Family Suite",
                    "Due camere comunicanti, angolo cottura e vista sul promontorio.",
                    350.00, IMG + "photo-1596394516093-501ba68a0ba6" + FIT, 4));
            roomRepository.save(new Room("Attico Esclusivo",
                    "Ultimo piano con jacuzzi in terrazza e accesso privato all'ascensore.",
                    500.00, IMG + "photo-1616594039964-ae9021a400a0" + FIT, 2));

            System.out.println("✅ Stanze inserite nel Database!");
        }

        // 2. Inserimento Admin
        String adminEmail = "admin@goldenstay.it";

        if (userRepository.findByEmail(adminEmail).isEmpty()) {

            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setName("Amministratore");

            admin.setPassword("admin123");

            admin.setRole("ADMIN");

            userRepository.save(admin);
            System.out.println("✅ Utente Admin creato con successo!");
        }
    }
}