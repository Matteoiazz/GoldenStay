package it.unical.webapp.angulargoldenstaybackend.controller;

import it.unical.webapp.angulargoldenstaybackend.dto.BookingRequest;
import it.unical.webapp.angulargoldenstaybackend.model.Booking;
import it.unical.webapp.angulargoldenstaybackend.model.Room;
import it.unical.webapp.angulargoldenstaybackend.model.User;
import it.unical.webapp.angulargoldenstaybackend.repository.BookingRepository;
import it.unical.webapp.angulargoldenstaybackend.repository.RoomRepository;
import it.unical.webapp.angulargoldenstaybackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    // 1. CREA PRENOTAZIONE
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {

        if (request.getCheckIn() == null || request.getCheckOut() == null
                || !request.getCheckOut().isAfter(request.getCheckIn())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "La partenza deve essere successiva all'arrivo"));
        }

        Optional<User> user = userRepository.findById(request.getUserId());
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Utente non trovato"));
        }

        Optional<Room> room = roomRepository.findById(request.getRoomId());
        if (room.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Camera non trovata"));
        }

        // La disponibilità va verificata di nuovo qui: fra la ricerca e il
        // pagamento un altro ospite potrebbe aver preso la stessa camera.
        if (bookingRepository.isRoomBusy(room.get().getId(), request.getCheckIn(), request.getCheckOut())) {
            return ResponseEntity.status(409)
                    .body(Map.of("error", "La camera non è più disponibile per queste date"));
        }

        Booking booking = new Booking();
        booking.setUser(user.get());
        booking.setRoom(room.get());
        booking.setCheckIn(request.getCheckIn());
        booking.setCheckOut(request.getCheckOut());
        booking.setTotalPrice(request.getTotalPrice());
        booking.setStatus(Booking.CONFERMATA);

        return ResponseEntity.ok(bookingRepository.save(booking));
    }

    // 2. REGISTRO COMPLETO (back office)
    @GetMapping("/all")
    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByIdDesc();
    }

    // 3. ANNULLA: la riga resta a registro con stato CANCELLATA
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        return bookingRepository.findById(id)
                .<ResponseEntity<?>>map(booking -> {
                    booking.setStatus(Booking.CANCELLATA);
                    return ResponseEntity.ok(bookingRepository.save(booking));
                })
                .orElseGet(() -> ResponseEntity.status(404)
                        .body(Map.of("error", "Prenotazione non trovata")));
    }

    // 4. ELIMINA DEFINITIVAMENTE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        if (!bookingRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Prenotazione non trovata"));
        }
        bookingRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Prenotazione eliminata"));
    }

    // 5. SVUOTA IL REGISTRO
    @DeleteMapping("/all")
    public ResponseEntity<?> deleteAllBookings() {
        bookingRepository.deleteAll();
        return ResponseEntity.ok(Map.of("message", "Registro svuotato"));
    }
}
