package it.unical.webapp.angulargoldenstaybackend.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("SUITE")
public class SuiteRoom extends Room {

    public SuiteRoom() {
        super();
        this.setTitle("Golden Suite");
        this.setDescription("Attico con terrazza esclusiva sul promontorio, jacuzzi privata e servizio dedicato.");
        this.setPricePerNight(300.00);
        this.setCapacity(4);
        this.setImageUrl("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80");
    }
}