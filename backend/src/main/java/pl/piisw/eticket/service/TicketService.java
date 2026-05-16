package pl.piisw.eticket.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import pl.piisw.eticket.dto.PurchaseRequest;
import pl.piisw.eticket.dto.TicketActivationRequest;
import pl.piisw.eticket.dto.TicketActivationResponse;
import pl.piisw.eticket.dto.TicketCheckRequest;
import pl.piisw.eticket.dto.TicketCheckResponse;
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
@Transactional
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TransactionRepository transactionRepository;
    private final OfferRepository offerRepository;

    public TicketPurchaseResponse purchaseTicket(AppUser user, PurchaseRequest request) {
        TicketOffer offer = offerRepository.findById(request.getOfferId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nie znaleziono oferty biletu!"));

        Instant now = Instant.now();
        Instant validFrom = request.getValidFrom();
        Instant validTo = null;

        if (offer.getTicketType() == TicketType.PERIOD) {
            if (validFrom == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "validFrom is required for PERIOD ticket");
            }
            validTo = validFrom.plus(offer.getValidityDays(), ChronoUnit.DAYS);
        } else {
            validFrom = null;
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

    public java.util.List<pl.piisw.eticket.dto.TicketResponse> getMyTickets(AppUser user) {
        return ticketRepository.findAllByUser(user).stream()
                .map(ticket -> pl.piisw.eticket.dto.TicketResponse.builder()
                        .id(ticket.getId())
                        .code(ticket.getCode())
                        .ticketType(ticket.getOffer().getTicketType())
                        .fareType(ticket.getOffer().getFareType())
                        .status(ticket.getStatus())
                        .purchasedAt(ticket.getPurchasedAt())
                        .activatedAt(ticket.getActivatedAt())
                        .activatedVehicleId(ticket.getActivatedVehicleId())
                        .validFrom(ticket.getValidFrom())
                        .validTo(ticket.getValidTo())
                        .build())
                .toList();
    }

    public TicketActivationResponse activateTicket(TicketActivationRequest request) {
        Ticket ticket = ticketRepository.findByCode(request.getTicketCode())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nie znaleziono biletu!"));

        if (ticket.getStatus() == TicketStatus.ACTIVATED
                || ticket.getStatus() == TicketStatus.INVALIDATED
                || ticket.getStatus() == TicketStatus.EXPIRED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bilet nie może zostać ponownie skasowany");
        }

        Instant activationTime = request.getActivationTime();
        ticket.setStatus(TicketStatus.ACTIVATED);
        ticket.setActivatedAt(activationTime);
        ticket.setActivatedVehicleId(request.getVehicleId());

        if (ticket.getOffer().getTicketType() == TicketType.TIME) {
            ticket.setValidFrom(activationTime);
            ticket.setValidTo(activationTime.plus(ticket.getOffer().getDurationMinutes(), ChronoUnit.MINUTES));
        }

        ticketRepository.save(ticket);

        return TicketActivationResponse.builder()
                .ticketCode(ticket.getCode())
                .result("ACTIVATED")
                .build();
    }

    public TicketCheckResponse checkTicket(TicketCheckRequest request) {
        Ticket ticket = ticketRepository.findByCode(request.getTicketCode())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nie znaleziono biletu!"));

        Instant controlTime = request.getControlTime();
        String vehicleId = request.getVehicleId();

        if (ticket.getStatus() == TicketStatus.INVALIDATED) {
            return invalidCheck(ticket, controlTime, "TICKET_INVALIDATED");
        }

        if (ticket.getStatus() == TicketStatus.EXPIRED) {
            return invalidCheck(ticket, controlTime, "TICKET_EXPIRED");
        }

        if (ticket.getOffer().getTicketType() == TicketType.PERIOD) {
            if (ticket.getValidFrom() == null || ticket.getValidTo() == null) {
                return invalidCheck(ticket, controlTime, "PERIOD_TICKET_NOT_READY");
            }
            if (controlTime.isBefore(ticket.getValidFrom())) {
                return invalidCheck(ticket, controlTime, "PERIOD_TICKET_NOT_YET_ACTIVE");
            }
            if (controlTime.isAfter(ticket.getValidTo())) {
                ticket.setStatus(TicketStatus.EXPIRED);
                ticketRepository.save(ticket);
                return invalidCheck(ticket, controlTime, "PERIOD_TICKET_EXPIRED");
            }
            return validCheck(ticket, controlTime, "PERIOD_TICKET_ACTIVE");
        }

        if (ticket.getStatus() != TicketStatus.ACTIVATED || ticket.getActivatedAt() == null) {
            return invalidCheck(ticket, controlTime, "TICKET_NOT_ACTIVATED");
        }

        if (!vehicleId.equals(ticket.getActivatedVehicleId())) {
            return invalidCheck(ticket, controlTime, "VEHICLE_MISMATCH");
        }

        if (ticket.getOffer().getTicketType() == TicketType.TIME) {
            Instant validTo = ticket.getValidTo();
            Instant validFrom = ticket.getValidFrom();
            if (validFrom == null || validTo == null) {
                return invalidCheck(ticket, controlTime, "TIME_TICKET_NOT_READY");
            }
            if (controlTime.isBefore(validFrom)) {
                return invalidCheck(ticket, controlTime, "TIME_TICKET_NOT_YET_ACTIVE");
            }
            if (controlTime.isAfter(validTo)) {
                ticket.setStatus(TicketStatus.EXPIRED);
                ticketRepository.save(ticket);
                return invalidCheck(ticket, controlTime, "TIME_TICKET_EXPIRED");
            }
            return validCheck(ticket, controlTime, "TIME_TICKET_ACTIVE");
        }

        return validCheck(ticket, controlTime, "SINGLE_TICKET_ACTIVE");
    }

    private TicketCheckResponse validCheck(Ticket ticket, Instant checkedAt, String reason) {
        return TicketCheckResponse.builder()
                .ticketCode(ticket.getCode())
                .status("VALID")
                .reason(reason)
                .checkedAt(checkedAt)
                .build();
    }

    private TicketCheckResponse invalidCheck(Ticket ticket, Instant checkedAt, String reason) {
        return TicketCheckResponse.builder()
                .ticketCode(ticket.getCode())
                .status("INVALID")
                .reason(reason)
                .checkedAt(checkedAt)
                .build();
    }
}
