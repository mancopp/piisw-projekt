package pl.piisw.eticket.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import pl.piisw.eticket.dto.PurchaseRequest;
import pl.piisw.eticket.dto.TicketResponse;
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
        String uniqueCode = "TCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Ticket ticket = createTicketByType(user, offer, uniqueCode, now, request.getValidFrom());
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

    public java.util.List<TicketResponse> getMyTickets(AppUser user) {
        return ticketRepository.findAllByUser(user).stream()
                .map(this::toTicketResponse)
                .toList();
    }

    public TicketResponse getMyTicketById(AppUser user, Long ticketId) {
        Ticket ticket = ticketRepository.findByIdAndUser(ticketId, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nie znaleziono biletu!"));
        return toTicketResponse(ticket);
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

        if (ticket.getOffer().getTicketType() == TicketType.TIME && ticket instanceof TimeBasedTicket timeTicket) {
            Integer durationMinutes = timeTicket.getDurationMinutes();
            if (durationMinutes == null) {
                durationMinutes = ticket.getOffer().getDurationMinutes();
                if (durationMinutes == null) {
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "TIME ticket is missing duration");
                }
                timeTicket.setDurationMinutes(durationMinutes);
            }
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

        // Check PERIOD tickets first (before general EXPIRED status check)
        if (ticket instanceof PeriodTicket periodTicket) {
            Instant validFrom = periodTicket.getValidFrom();
            Instant validTo = periodTicket.getValidTo();
            
            if (validFrom == null || validTo == null) {
                return invalidCheck(ticket, controlTime, "PERIOD_TICKET_NOT_READY");
            }
            if (controlTime.isBefore(validFrom)) {
                return invalidCheck(ticket, controlTime, "PERIOD_TICKET_NOT_STARTED");
            }
            if (controlTime.isAfter(validTo)) {
                ticket.setStatus(TicketStatus.EXPIRED);
                ticketRepository.save(ticket);
                return invalidCheck(ticket, controlTime, "PERIOD_TICKET_EXPIRED");
            }
            return validCheck(ticket, controlTime, "PERIOD_TICKET_ACTIVE");
        }

        if (ticket.getStatus() == TicketStatus.EXPIRED) {
            return invalidCheck(ticket, controlTime, "TICKET_EXPIRED");
        }

        if (ticket.getStatus() != TicketStatus.ACTIVATED || ticket.getActivatedAt() == null) {
            return invalidCheck(ticket, controlTime, "TICKET_NOT_ACTIVATED");
        }

        if (!vehicleId.equals(ticket.getActivatedVehicleId())) {
            return invalidCheck(ticket, controlTime, "VEHICLE_MISMATCH");
        }

        if (ticket instanceof TimeBasedTicket timeTicket) {
            Instant validFrom = timeTicket.getActivatedAt();
            Integer durationMinutes = timeTicket.getDurationMinutes();
            
            if (validFrom == null || durationMinutes == null) {
                return invalidCheck(ticket, controlTime, "TIME_TICKET_NOT_READY");
            }
            Instant validTo = validFrom.plus(durationMinutes, ChronoUnit.MINUTES);
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

    private Ticket createTicketByType(AppUser user, TicketOffer offer, String code, Instant now, Instant validFrom) {
        return switch (offer.getTicketType()) {
            case SINGLE -> {
                SingleUseTicket ticket = new SingleUseTicket();
                ticket.setUser(user);
                ticket.setOffer(offer);
                ticket.setCode(code);
                ticket.setStatus(TicketStatus.PURCHASED);
                ticket.setPurchasedAt(now);
                yield ticket;
            }
            case TIME -> {
                Integer durationMinutes = offer.getDurationMinutes();
                if (durationMinutes == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "durationMinutes is required for TIME ticket");
                }
                TimeBasedTicket ticket = new TimeBasedTicket();
                ticket.setUser(user);
                ticket.setOffer(offer);
                ticket.setCode(code);
                ticket.setStatus(TicketStatus.PURCHASED);
                ticket.setPurchasedAt(now);
                ticket.setDurationMinutes(durationMinutes);
                yield ticket;
            }
            case PERIOD -> {
                if (validFrom == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "validFrom is required for PERIOD ticket");
                }
                Integer validityDays = offer.getValidityDays();
                if (validityDays == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "validityDays is required for PERIOD ticket");
                }
                Instant validTo = validFrom.plus(validityDays, ChronoUnit.DAYS);
                PeriodTicket ticket = new PeriodTicket();
                ticket.setUser(user);
                ticket.setOffer(offer);
                ticket.setCode(code);
                ticket.setStatus(TicketStatus.PURCHASED);
                ticket.setPurchasedAt(now);
                ticket.setValidFrom(validFrom);
                ticket.setValidTo(validTo);
                yield ticket;
            }
        };
    }

    private TicketResponse toTicketResponse(Ticket ticket) {
        Instant validFrom = null;
        Instant validTo = null;

        if (ticket instanceof PeriodTicket periodTicket) {
            validFrom = periodTicket.getValidFrom();
            validTo = periodTicket.getValidTo();
        } else if (ticket instanceof TimeBasedTicket timeTicket) {
            Instant activatedAt = timeTicket.getActivatedAt();
            Integer durationMinutes = timeTicket.getDurationMinutes();
            if (activatedAt != null && durationMinutes != null) {
                validFrom = activatedAt;
                validTo = activatedAt.plus(durationMinutes, ChronoUnit.MINUTES);
            }
        }

        return TicketResponse.builder()
                .id(ticket.getId())
                .code(ticket.getCode())
                .ticketType(ticket.getOffer().getTicketType())
                .fareType(ticket.getOffer().getFareType())
                .status(ticket.getStatus())
                .purchasedAt(ticket.getPurchasedAt())
                .activatedAt(ticket.getActivatedAt())
                .activatedVehicleId(ticket.getActivatedVehicleId())
                .validFrom(validFrom)
                .validTo(validTo)
                .build();
    }
}
