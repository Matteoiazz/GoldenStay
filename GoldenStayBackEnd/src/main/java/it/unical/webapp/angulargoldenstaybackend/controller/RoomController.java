package it.unical.webapp.angulargoldenstaybackend.controller;

import it.unical.webapp.angulargoldenstaybackend.factory.RoomFactory;
import it.unical.webapp.angulargoldenstaybackend.model.Room;
import it.unical.webapp.angulargoldenstaybackend.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomRepository roomRepository;

    /** Le factory sono raccolte per nome del bean: STANDARD, DELUXE, SUITE. */
    @Autowired
    private Map<String, RoomFactory> factories;

    // 1. LISTA CAMERE, filtrata per disponibilità quando arrivano le date
    @GetMapping
    public List<Room> getAllRooms(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {

        if (checkIn != null && checkOut != null && checkOut.isAfter(checkIn)) {
            return roomRepository.findAvailableRooms(checkIn, checkOut);
        }

        return roomRepository.findAllByOrderByPricePerNightDesc();
    }

    // 2. SINGOLA CAMERA
    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable Long id) {
        return roomRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 3. CREAZIONE DA FACTORY
    @PostMapping("/factory/{type}")
    public ResponseEntity<?> createRoomFactory(@PathVariable String type) {
        RoomFactory factory = factories.get(type.toUpperCase());

        if (factory == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Tipo di camera non valido: " + type));
        }

        return ResponseEntity.ok(roomRepository.save(factory.createRoom()));
    }

    // 4. ELIMINA CAMERA
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoom(@PathVariable Long id) {
        if (!roomRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Camera non trovata"));
        }

        roomRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Camera eliminata"));
    }

    // 5. MODIFICA CAMERA
    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable Long id, @RequestBody Room roomDetails) {
        return roomRepository.findById(id)
                .map(existing -> {
                    existing.setTitle(roomDetails.getTitle());
                    existing.setDescription(roomDetails.getDescription());
                    existing.setPricePerNight(roomDetails.getPricePerNight());
                    existing.setCapacity(roomDetails.getCapacity());

                    if (roomDetails.getImageUrl() != null && !roomDetails.getImageUrl().isBlank()) {
                        existing.setImageUrl(roomDetails.getImageUrl());
                    }

                    return ResponseEntity.ok(roomRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
