package pl.piisw.eticket.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.piisw.eticket.dto.PurchaseRequest;
import pl.piisw.eticket.dto.TicketPurchaseResponse;
import pl.piisw.eticket.model.*;
import pl.piisw.eticket.repository.OfferRepository;
import pl.piisw.eticket.repository.TicketRepository;
import pl.piisw.eticket.repository.TransactionRepository;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TransactionRepository transactionRepository;
    private final OfferRepository offerRepository;

    public TicketPurchaseResponse purchaseTicket(AppUser user, PurchaseRequest request) {
        TicketOffer offer = offerRepository.findById(request.getOfferId())
                .orElseThrow(() -> new IllegalArgumentException("Nie znaleziono oferty biletu!"));

        Instant now = Instant.now();
        Instant validFrom = request.getValidFrom() != null ? request.getValidFrom() : null;
        Instant validTo = null;

        if (offer.getTicketType() == TicketType.PERIOD && validFrom != null) {
            validTo = validFrom.plus(offer.getValidityDays(), ChronoUnit.DAYS);
        }

        String uniqueCode = "TCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Ticket ticket = Ticket.builder()
                .user(user)
                .offer(offer)
                .code(uniqueCode)
                .status(TicketStatus.PURCHASED)
                .purchasedAt(now)
                .validFrom(validFrom)
                .validTo(validTo)
                .build();

        ticket = ticketRepository.save(ticket);

        Transaction transaction = Transaction.builder()
                .user(user)
                .ticket(ticket)
                .amount(offer.getPrice())
                .currency("PLN")
                .status(TransactionStatus.SUCCESS)
                .createdAt(now)
                .build();

        transactionRepository.save(transaction);

        return TicketPurchaseResponse.builder()
                .ticketId(ticket.getId())
                .code(ticket.getCode())
                .status(ticket.getStatus())
                .ticketType(offer.getTicketType())
                .build();
    }
}