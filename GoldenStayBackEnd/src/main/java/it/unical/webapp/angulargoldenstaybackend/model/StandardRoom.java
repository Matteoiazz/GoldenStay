package it.unical.webapp.angulargoldenstaybackend.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("STANDARD")
public class StandardRoom extends Room {

    public StandardRoom() {
        super();
        this.setTitle("Camera Standard");
        this.setDescription("Essenziale e luminosa, affacciata sul cortile interno con letto matrimoniale e scrivania.");
        this.setPricePerNight(80.00);
        this.setCapacity(2);
        this.setImageUrl("https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80");
    }
}