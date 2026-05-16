package pl.piisw.eticket.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.test.context.ActiveProfiles;
import pl.piisw.eticket.dto.PurchaseRequest;
import pl.piisw.eticket.dto.TicketActivationRequest;
import pl.piisw.eticket.dto.TicketCheckRequest;
import pl.piisw.eticket.model.AppUser;
import pl.piisw.eticket.model.TicketStatus;
import pl.piisw.eticket.model.UserRole;
import pl.piisw.eticket.repository.OfferRepository;
import pl.piisw.eticket.repository.TicketRepository;
import pl.piisw.eticket.repository.UserRepository;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TicketServiceTest {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private OfferRepository offerRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void activatesSingleTicketAndKeepsItInRepository() {
        AppUser user = userRepository.save(passenger());
        var purchase = ticketService.purchaseTicket(user, new PurchaseRequest(1L, null));

        var activationTime = Instant.parse("2026-05-16T10:00:00Z");
        var activation = ticketService.activateTicket(new TicketActivationRequest(purchase.getCode(), "KR-105", activationTime));

        assertEquals("ACTIVATED", activation.getResult());
        assertEquals(TicketStatus.ACTIVATED, ticketRepository.findByCode(purchase.getCode()).orElseThrow().getStatus());
    }

    @Test
    void checksActivatedTimeTicketAsValidWithinRange() {
        AppUser user = userRepository.save(passenger());
        var purchase = ticketService.purchaseTicket(user, new PurchaseRequest(3L, null));
        var activationTime = Instant.parse("2026-05-16T10:00:00Z");
        ticketService.activateTicket(new TicketActivationRequest(purchase.getCode(), "KR-105", activationTime));

        var result = ticketService.checkTicket(new TicketCheckRequest(
                purchase.getCode(),
                "KR-105",
                Instant.parse("2026-05-16T10:10:00Z")
        ));

        assertEquals("VALID", result.getStatus());
        assertEquals("TIME_TICKET_ACTIVE", result.getReason());
    }

    @Test
    void requiresValidFromForPeriodTicketPurchase() {
        AppUser user = userRepository.save(passenger());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> ticketService.purchaseTicket(user, new PurchaseRequest(4L, null)));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void loadsSeededOffers() {
        assertTrue(offerRepository.count() >= 4);
    }

    private AppUser passenger() {
        return AppUser.builder()
                .email("user@example.com")
                .passwordHash("hash")
                .role(UserRole.PASSENGER)
                .build();
    }
}
