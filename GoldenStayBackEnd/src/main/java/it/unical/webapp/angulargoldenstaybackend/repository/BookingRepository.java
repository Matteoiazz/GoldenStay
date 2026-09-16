package it.unical.webapp.angulargoldenstaybackend.repository;

import it.unical.webapp.angulargoldenstaybackend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByRoomId(Long roomId);

    List<Booking> findAllByOrderByIdDesc();

    /**
     * Vero se la camera ha già una prenotazione attiva che si sovrappone
     * all'intervallo richiesto. Il giorno di partenza non conta come occupato.
     */
    @Query("""
            SELECT COUNT(b) > 0 FROM Booking b
            WHERE b.room.id = :roomId
              AND b.status <> 'CANCELLATA'
              AND b.checkIn < :checkOut
              AND b.checkOut > :checkIn
            """)
    boolean isRoomBusy(@Param("roomId") Long roomId,
                       @Param("checkIn") LocalDate checkIn,
                       @Param("checkOut") LocalDate checkOut);
}
