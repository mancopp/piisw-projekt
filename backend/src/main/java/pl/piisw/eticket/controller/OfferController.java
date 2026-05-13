package pl.piisw.eticket.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.piisw.eticket.model.TicketOffer;
import pl.piisw.eticket.service.OfferService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/offers")
@RequiredArgsConstructor
public class OfferController {

    private final OfferService offerService;

    @GetMapping
    public ResponseEntity<List<TicketOffer>> getOffers() {
        return ResponseEntity.ok(offerService.getAllOffers());
    }
}