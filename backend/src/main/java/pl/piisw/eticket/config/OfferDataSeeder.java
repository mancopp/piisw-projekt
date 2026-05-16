package pl.piisw.eticket.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pl.piisw.eticket.model.FareType;
import pl.piisw.eticket.model.TicketOffer;
import pl.piisw.eticket.model.TicketType;
import pl.piisw.eticket.repository.OfferRepository;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class OfferDataSeeder implements CommandLineRunner {

    private final OfferRepository offerRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (offerRepository.count() > 0) {
            return;
        }

        offerRepository.save(new TicketOffer(null, "Bilet jednorazowy normalny", TicketType.SINGLE, FareType.NORMAL, null, null, new BigDecimal("4.60")));
        offerRepository.save(new TicketOffer(null, "Bilet jednorazowy ulgowy", TicketType.SINGLE, FareType.REDUCED, null, null, new BigDecimal("2.30")));
        offerRepository.save(new TicketOffer(null, "Bilet czasowy 20 min normalny", TicketType.TIME, FareType.NORMAL, 20, null, new BigDecimal("3.40")));
        offerRepository.save(new TicketOffer(null, "Bilet okresowy 30 dni normalny", TicketType.PERIOD, FareType.NORMAL, null, 30, new BigDecimal("110.00")));
    }
}
