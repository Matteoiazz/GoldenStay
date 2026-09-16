package it.unical.webapp.angulargoldenstaybackend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "bookings")
public class Booking {

    public static final String CONFERMATA = "CONFERMATA";
    public static final String CANCELLATA = "CANCELLATA";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate checkIn;
    private LocalDate checkOut;

    private double totalPrice;

    @Column(nullable = false)
    private String status;

    // Molte prenotazioni appartengono a un Utente
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Molte prenotazioni appartengono a una Stanza
    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    public Booking() {
        this.status = CONFERMATA;
    }

    public Booking(LocalDate checkIn, LocalDate checkOut, double totalPrice, String status, User user, Room room) {
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.totalPrice = totalPrice;
        this.status = status;
        this.user = user;
        this.room = room;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getCheckIn() { return checkIn; }
    public void setCheckIn(LocalDate checkIn) { this.checkIn = checkIn; }
    public LocalDate getCheckOut() { return checkOut; }
    public void setCheckOut(LocalDate checkOut) { this.checkOut = checkOut; }
    public double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(double totalPrice) { this.totalPrice = totalPrice; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }
}
