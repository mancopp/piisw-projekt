package pl.piisw.eticket.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.piisw.eticket.model.TicketOffer;

@Repository
public interface OfferRepository extends JpaRepository<TicketOffer, Long> {
}
