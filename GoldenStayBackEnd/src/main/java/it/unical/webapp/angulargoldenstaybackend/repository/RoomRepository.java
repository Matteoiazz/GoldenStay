package it.unical.webapp.angulargoldenstaybackend.repository;

import it.unical.webapp.angulargoldenstaybackend.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    /**
     * Camere libere nell'intervallo richiesto. Le prenotazioni annullate non
     * occupano la camera, e il giorno di partenza è già riassegnabile.
     */
    @Query("""
            SELECT r FROM Room r
            WHERE r.id NOT IN (
                SELECT b.room.id FROM Booking b
                WHERE b.status <> 'CANCELLATA'
                  AND b.checkIn < :checkOut
                  AND b.checkOut > :checkIn
            )
            ORDER BY r.pricePerNight DESC
            """)
    List<Room> findAvailableRooms(@Param("checkIn") LocalDate checkIn,
                                  @Param("checkOut") LocalDate checkOut);

    List<Room> findAllByOrderByPricePerNightDesc();
}
