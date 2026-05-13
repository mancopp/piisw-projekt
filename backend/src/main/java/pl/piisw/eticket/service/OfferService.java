package pl.piisw.eticket.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.piisw.eticket.model.TicketOffer;
import pl.piisw.eticket.repository.OfferRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OfferService {

    private final OfferRepository offerRepository;

    public List<TicketOffer> getAllOffers() {
        return offerRepository.findAll();
    }
}