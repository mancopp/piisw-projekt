package pl.piisw.eticket.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
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
import pl.piisw.eticket.model.PeriodTicket;
import pl.piisw.eticket.model.SingleUseTicket;
import pl.piisw.eticket.model.TicketStatus;
import pl.piisw.eticket.model.TimeBasedTicket;
import pl.piisw.eticket.model.UserRole;
import pl.piisw.eticket.repository.OfferRepository;
import pl.piisw.eticket.repository.TicketRepository;
import pl.piisw.eticket.repository.UserRepository;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("Ticket Service Integration Tests")
class TicketServiceTest {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private OfferRepository offerRepository;

    @Autowired
    private UserRepository userRepository;

    private AppUser passenger() {
        return AppUser.builder()
                .email("user@example.com")
                .passwordHash("hash")
                .role(UserRole.PASSENGER)
                .build();
    }

    private AppUser inspector() {
        return AppUser.builder()
                .email("inspector@example.com")
                .passwordHash("hash")
                .role(UserRole.INSPECTOR)
                .build();
    }

    @Nested
    @DisplayName("Scenario 1: Happy Path - Single Ticket Lifecycle")
    class SingleTicketLifecycleScenario {

        @Test
        @DisplayName("Passenger buys single ticket -> validator punches -> inspector verifies")
        void happyPathSingleTicket() {
            // Step 1: Passenger buys single ticket
            AppUser passenger = userRepository.save(passenger());
            var purchase = ticketService.purchaseTicket(passenger, new PurchaseRequest(1L, null));
            
            assertEquals(TicketStatus.PURCHASED.toString(), purchase.getStatus().toString());
            assertNotNull(purchase.getCode());

            // Step 2: Validator punches ticket
            var activationTime = Instant.parse("2026-05-16T08:15:00Z");
            var activation = ticketService.activateTicket(
                    new TicketActivationRequest(purchase.getCode(), "KR-101", activationTime)
            );
            
            assertEquals("ACTIVATED", activation.getResult());

            // Step 3: Inspector checks ticket on same vehicle (VALID)
            var check = ticketService.checkTicket(new TicketCheckRequest(
                    purchase.getCode(),
                    "KR-101",
                    Instant.parse("2026-05-16T08:20:00Z")
            ));
            
            assertEquals("VALID", check.getStatus());
            assertEquals("SINGLE_TICKET_ACTIVE", check.getReason());

            // Step 4: Inspector checks on different vehicle (INVALID)
            var checkDifferentVehicle = ticketService.checkTicket(new TicketCheckRequest(
                    purchase.getCode(),
                    "KR-999",
                    Instant.parse("2026-05-16T08:20:00Z")
            ));
            
            assertEquals("INVALID", checkDifferentVehicle.getStatus());
            assertEquals("VEHICLE_MISMATCH", checkDifferentVehicle.getReason());
        }
    }

    @Nested
    @DisplayName("Scenario 2: Time Ticket Expiration")
    class TimeTicketExpirationScenario {

        @Test
        @DisplayName("Time ticket expires after duration window")
        void timeTicketExpiresAfterDuration() {
            AppUser passenger = userRepository.save(passenger());
            
            // Step 1: Purchase 20-minute time ticket
            var purchase = ticketService.purchaseTicket(passenger, new PurchaseRequest(3L, null));
            
            // Step 2: Validator activates at T+0
            var activationTime = Instant.parse("2026-05-16T08:00:00Z");
            var activation = ticketService.activateTicket(
                    new TicketActivationRequest(purchase.getCode(), "KR-101", activationTime)
            );
            assertEquals("ACTIVATED", activation.getResult());

            // Step 3: Check at T+10min (within 20min window) - VALID
            var checkWithin = ticketService.checkTicket(new TicketCheckRequest(
                    purchase.getCode(),
                    "KR-101",
                    Instant.parse("2026-05-16T08:10:00Z")
            ));
            assertEquals("VALID", checkWithin.getStatus());
            assertEquals("TIME_TICKET_ACTIVE", checkWithin.getReason());

            // Step 4: Check at T+25min (after 20min window) - EXPIRED
            var checkExpired = ticketService.checkTicket(new TicketCheckRequest(
                    purchase.getCode(),
                    "KR-101",
                    Instant.parse("2026-05-16T08:25:00Z")
            ));
            assertEquals("INVALID", checkExpired.getStatus());
            assertEquals("TIME_TICKET_EXPIRED", checkExpired.getReason());

            // Step 5: Try to reactivate expired ticket - should fail
            ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                    ticketService.activateTicket(
                            new TicketActivationRequest(purchase.getCode(), "KR-101", 
                                    Instant.parse("2026-05-16T08:30:00Z"))
                    )
            );
            assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        }
    }

    @Nested
    @DisplayName("Scenario 3: Period Ticket (No Activation Needed)")
    class PeriodTicketScenario {

        @Test
        @DisplayName("Period ticket is valid by date range, no punch required")
        void periodTicketValidByDateRange() {
            AppUser passenger = userRepository.save(passenger());
            
            // Step 1: Purchase 30-day period ticket
            var validFrom = Instant.parse("2026-05-01T00:00:00Z");
            var purchase = ticketService.purchaseTicket(passenger, new PurchaseRequest(4L, validFrom));
            
            assertNotNull(purchase.getCode());

            // Step 2: Check within valid range (2026-05-10) - VALID
            var checkWithin = ticketService.checkTicket(new TicketCheckRequest(
                    purchase.getCode(),
                    "ANY-VEHICLE",
                    Instant.parse("2026-05-10T10:00:00Z")
            ));
            assertEquals("VALID", checkWithin.getStatus());
            assertEquals("PERIOD_TICKET_ACTIVE", checkWithin.getReason());

            // Step 3: Check after expiry (2026-06-01) - EXPIRED
            var checkExpired = ticketService.checkTicket(new TicketCheckRequest(
                    purchase.getCode(),
                    "ANY-VEHICLE",
                    Instant.parse("2026-06-01T10:00:00Z")
            ));
            assertEquals("INVALID", checkExpired.getStatus());
            assertEquals("PERIOD_TICKET_EXPIRED", checkExpired.getReason());

            // Step 4: Check before start (2026-04-30) - NOT STARTED
            var checkBeforeStart = ticketService.checkTicket(new TicketCheckRequest(
                    purchase.getCode(),
                    "ANY-VEHICLE",
                    Instant.parse("2026-04-30T10:00:00Z")
            ));
            assertEquals("INVALID", checkBeforeStart.getStatus());
            assertEquals("PERIOD_TICKET_NOT_STARTED", checkBeforeStart.getReason());
        }
    }

    @Nested
    @DisplayName("Scenario 4: Error Cases")
    class ErrorCasesScenario {

        @Test
        @DisplayName("Cannot buy non-existent offer")
        void buyNonExistentOffer() {
            AppUser passenger = userRepository.save(passenger());
            
            ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                    ticketService.purchaseTicket(passenger, new PurchaseRequest(999L, null))
            );
            assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        }

        @Test
        @DisplayName("Cannot buy period ticket without validFrom")
        void buyPeriodTicketWithoutValidFrom() {
            AppUser passenger = userRepository.save(passenger());
            
            ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                    ticketService.purchaseTicket(passenger, new PurchaseRequest(4L, null))
            );
            assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        }

        @Test
        @DisplayName("Cannot activate non-existent ticket")
        void activateNonExistentTicket() {
            ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                    ticketService.activateTicket(
                            new TicketActivationRequest("TCK-FAKE-XYZ", "KR-101", 
                                    Instant.parse("2026-05-16T08:00:00Z"))
                    )
            );
            assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        }

        @Test
        @DisplayName("Cannot reactivate already-activated ticket")
        void cannotReactivateTicket() {
            AppUser passenger = userRepository.save(passenger());
            var purchase = ticketService.purchaseTicket(passenger, new PurchaseRequest(1L, null));
            
            // First activation - should work
            var activation = ticketService.activateTicket(
                    new TicketActivationRequest(purchase.getCode(), "KR-101", 
                            Instant.parse("2026-05-16T08:00:00Z"))
            );
            assertEquals("ACTIVATED", activation.getResult());

            // Try second activation - should fail with 409 CONFLICT
            ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                    ticketService.activateTicket(
                            new TicketActivationRequest(purchase.getCode(), "KR-101", 
                                    Instant.parse("2026-05-16T09:00:00Z"))
                    )
            );
            assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        }

        @Test
        @DisplayName("Cannot check unactivated single ticket")
        void checkUnactivatedTicketInvalid() {
            AppUser passenger = userRepository.save(passenger());
            var purchase = ticketService.purchaseTicket(passenger, new PurchaseRequest(1L, null));
            
            // Check without activation - should be invalid
            var check = ticketService.checkTicket(new TicketCheckRequest(
                    purchase.getCode(),
                    "KR-101",
                    Instant.parse("2026-05-16T08:00:00Z")
            ));
            
            assertEquals("INVALID", check.getStatus());
            assertEquals("TICKET_NOT_ACTIVATED", check.getReason());
        }
    }

    @Nested
    @DisplayName("Scenario 5: Authorization & Role-Based Access (implicit via service)")
    class AuthorizationScenario {

        @Test
        @DisplayName("Ticket data persists correctly in repository")
        void ticketDataPersistsCorrectly() {
            AppUser passenger = userRepository.save(passenger());
            var purchase = ticketService.purchaseTicket(passenger, new PurchaseRequest(1L, null));
            
            var savedTicket = ticketRepository.findByCode(purchase.getCode()).orElseThrow();
            
            assertEquals(purchase.getCode(), savedTicket.getCode());
            assertEquals(TicketStatus.PURCHASED, savedTicket.getStatus());
            assertEquals(passenger.getId(), savedTicket.getUser().getId());
        }

        @Test
        @DisplayName("Activated ticket status updates in repository")
        void activatedTicketStatusUpdates() {
            AppUser passenger = userRepository.save(passenger());
            var purchase = ticketService.purchaseTicket(passenger, new PurchaseRequest(1L, null));
            
            var beforeActivation = ticketRepository.findByCode(purchase.getCode()).orElseThrow();
            assertEquals(TicketStatus.PURCHASED, beforeActivation.getStatus());

            ticketService.activateTicket(
                    new TicketActivationRequest(purchase.getCode(), "KR-101", 
                            Instant.parse("2026-05-16T08:00:00Z"))
            );

            var afterActivation = ticketRepository.findByCode(purchase.getCode()).orElseThrow();
            assertEquals(TicketStatus.ACTIVATED, afterActivation.getStatus());
        }

        @Test
        @DisplayName("Passenger can fetch own ticket by id")
        void passengerCanFetchOwnTicketById() {
            AppUser passenger = userRepository.save(passenger());
            var purchase = ticketService.purchaseTicket(passenger, new PurchaseRequest(1L, null));
            Long ticketId = ticketRepository.findByCode(purchase.getCode()).orElseThrow().getId();

            var ticket = ticketService.getMyTicketById(passenger, ticketId);

            assertEquals(ticketId, ticket.getId());
            assertEquals(purchase.getCode(), ticket.getCode());
        }

        @Test
        @DisplayName("Passenger cannot fetch ticket owned by another user")
        void passengerCannotFetchAnotherUsersTicketById() {
            AppUser owner = userRepository.save(passenger());
            AppUser anotherPassenger = userRepository.save(
                    AppUser.builder()
                            .email("another-user@example.com")
                            .passwordHash("hash")
                            .role(UserRole.PASSENGER)
                            .build()
            );
            var purchase = ticketService.purchaseTicket(owner, new PurchaseRequest(1L, null));
            Long ticketId = ticketRepository.findByCode(purchase.getCode()).orElseThrow().getId();

            ResponseStatusException exception = assertThrows(
                    ResponseStatusException.class,
                    () -> ticketService.getMyTicketById(anotherPassenger, ticketId)
            );
            assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        }
    }

    @Nested
    @DisplayName("Scenario 6: Seeded Test Data")
    class SeededDataScenario {

        @Test
        @DisplayName("Seeded offers are loaded")
        void seededOffersLoaded() {
            assertTrue(offerRepository.count() >= 4,
                    "Should have at least 4 seeded offers (SINGLE NORMAL, SINGLE REDUCED, TIME, PERIOD)");
        }

        @Test
        @DisplayName("Can purchase each offer type")
        void canPurchaseEachOfferType() {
            AppUser passenger = userRepository.save(passenger());
            
            // SINGLE offer (id=1)
            var singlePurchase = ticketService.purchaseTicket(passenger, new PurchaseRequest(1L, null));
            assertNotNull(singlePurchase.getCode());

            // TIME offer (id=3)
            var timePurchase = ticketService.purchaseTicket(passenger, new PurchaseRequest(3L, null));
            assertNotNull(timePurchase.getCode());

            // PERIOD offer (id=4) with validFrom
            var periodPurchase = ticketService.purchaseTicket(passenger, new PurchaseRequest(4L, 
                    Instant.parse("2026-05-01T00:00:00Z")));
            assertNotNull(periodPurchase.getCode());

            assertEquals(3, ticketRepository.findAllByUser(passenger).size());
        }

        @Test
        @DisplayName("Purchased tickets are stored as proper inheritance subclasses")
        void purchasedTicketsUseProperSubclassTypes() {
            AppUser passenger = userRepository.save(passenger());
            Instant periodStart = Instant.parse("2026-05-01T00:00:00Z");

            var singlePurchase = ticketService.purchaseTicket(passenger, new PurchaseRequest(1L, null));
            var timePurchase = ticketService.purchaseTicket(passenger, new PurchaseRequest(3L, null));
            var periodPurchase = ticketService.purchaseTicket(passenger, new PurchaseRequest(4L, periodStart));

            var singleTicket = ticketRepository.findByCode(singlePurchase.getCode()).orElseThrow();
            var timeTicket = ticketRepository.findByCode(timePurchase.getCode()).orElseThrow();
            var periodTicket = ticketRepository.findByCode(periodPurchase.getCode()).orElseThrow();

            assertInstanceOf(SingleUseTicket.class, singleTicket);
            assertInstanceOf(TimeBasedTicket.class, timeTicket);
            assertInstanceOf(PeriodTicket.class, periodTicket);

            TimeBasedTicket castedTimeTicket = (TimeBasedTicket) timeTicket;
            assertEquals(castedTimeTicket.getOffer().getDurationMinutes(), castedTimeTicket.getDurationMinutes());

            PeriodTicket castedPeriodTicket = (PeriodTicket) periodTicket;
            assertEquals(periodStart, castedPeriodTicket.getValidFrom());
            assertEquals(
                    periodStart.plus(castedPeriodTicket.getOffer().getValidityDays(), ChronoUnit.DAYS),
                    castedPeriodTicket.getValidTo()
            );
        }
    }

    @Test
    @DisplayName("Original test: Activates single ticket and keeps it in repository")
    void activatesSingleTicketAndKeepsItInRepository() {
        AppUser user = userRepository.save(passenger());
        var purchase = ticketService.purchaseTicket(user, new PurchaseRequest(1L, null));

        var activationTime = Instant.parse("2026-05-16T10:00:00Z");
        var activation = ticketService.activateTicket(new TicketActivationRequest(purchase.getCode(), "KR-105", activationTime));

        assertEquals("ACTIVATED", activation.getResult());
        assertEquals(TicketStatus.ACTIVATED, ticketRepository.findByCode(purchase.getCode()).orElseThrow().getStatus());
    }

    @Test
    @DisplayName("Original test: Checks activated time ticket as valid within range")
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
    @DisplayName("Original test: Requires validFrom for period ticket purchase")
    void requiresValidFromForPeriodTicketPurchase() {
        AppUser user = userRepository.save(passenger());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> ticketService.purchaseTicket(user, new PurchaseRequest(4L, null)));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    @DisplayName("Original test: Loads seeded offers")
    void loadsSeededOffers() {
        assertTrue(offerRepository.count() >= 4);
    }
}
