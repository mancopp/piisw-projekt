package pl.piisw.eticket.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pl.piisw.eticket.dto.PurchaseRequest;
import pl.piisw.eticket.dto.TicketActivationRequest;
import pl.piisw.eticket.model.AppUser;
import pl.piisw.eticket.model.UserRole;
import pl.piisw.eticket.repository.TicketRepository;
import pl.piisw.eticket.repository.UserRepository;
import pl.piisw.eticket.service.TicketService;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Order(2)
public class TestDataSeeder implements CommandLineRunner {

    private static final String PASSENGER_EMAIL = "passenger@example.com";
    private static final String INSPECTOR_EMAIL = "inspector@example.com";

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final TicketService ticketService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        AppUser passenger = ensureUser(PASSENGER_EMAIL, "Passenger123!", UserRole.PASSENGER);
        ensureUser(INSPECTOR_EMAIL, "Inspector123!", UserRole.INSPECTOR);

        if (ticketRepository.count() > 0) {
            return;
        }

        var single = ticketService.purchaseTicket(passenger, new PurchaseRequest(1L, null));
        ticketService.activateTicket(new TicketActivationRequest(single.getCode(), "KR-101", Instant.parse("2026-05-16T08:00:00Z")));

        ticketService.purchaseTicket(passenger, new PurchaseRequest(3L, null));

        ticketService.purchaseTicket(passenger, new PurchaseRequest(4L, Instant.parse("2026-05-01T00:00:00Z")));
    }

    private AppUser ensureUser(String email, String password, UserRole role) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.save(AppUser.builder()
                        .email(email)
                        .passwordHash(passwordEncoder.encode(password))
                        .role(role)
                        .build()));
    }
}
