package pl.piisw.eticket.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.piisw.eticket.model.AppUser;
import pl.piisw.eticket.model.Ticket;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findAllByUser(AppUser user);

    Optional<Ticket> findByCode(String code);
}
