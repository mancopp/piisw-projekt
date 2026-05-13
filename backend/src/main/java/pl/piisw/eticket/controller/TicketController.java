package pl.piisw.eticket.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import pl.piisw.eticket.dto.PurchaseRequest;
import pl.piisw.eticket.dto.TicketPurchaseResponse;
import pl.piisw.eticket.model.AppUser;
import pl.piisw.eticket.service.TicketService;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping("/purchase")
    public ResponseEntity<TicketPurchaseResponse> purchaseTicket(
            @AuthenticationPrincipal AppUser user,
            @RequestBody PurchaseRequest request) {

        TicketPurchaseResponse response = ticketService.purchaseTicket(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<java.util.List<pl.piisw.eticket.dto.TicketResponse>> getMyTickets(
            @AuthenticationPrincipal AppUser user) {
        return ResponseEntity.ok(ticketService.getMyTickets(user));
    }
}