package pl.piisw.eticket.repository;

import org.springframework.stereotype.Repository;
import pl.piisw.eticket.model.FareType;
import pl.piisw.eticket.model.TicketOffer;
import pl.piisw.eticket.model.TicketType;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public class OfferRepository {

    private final List<TicketOffer> offers = List.of(
            new TicketOffer(1L, "Bilet jednorazowy normalny", TicketType.SINGLE, FareType.NORMAL, null, null, new BigDecimal("4.60")),
            new TicketOffer(2L, "Bilet jednorazowy ulgowy", TicketType.SINGLE, FareType.REDUCED, null, null, new BigDecimal("2.30")),
            new TicketOffer(3L, "Bilet czasowy 20 min normalny", TicketType.TIME, FareType.NORMAL, 20, null, new BigDecimal("3.40")),
            new TicketOffer(4L, "Bilet okresowy 30 dni normalny", TicketType.PERIOD, FareType.NORMAL, null, 30, new BigDecimal("110.00"))
    );

    public List<TicketOffer> findAll() {
        return offers;
    }

    public Optional<TicketOffer> findById(Long id) {
        return offers.stream()
                .filter(offer -> offer.getId().equals(id))
                .findFirst();
    }
}