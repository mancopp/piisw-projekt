package pl.piisw.eticket.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.piisw.eticket.dto.TicketCheckRequest;
import pl.piisw.eticket.dto.TicketCheckResponse;
import pl.piisw.eticket.service.TicketService;

@RestController
@RequestMapping("/api/v1/inspector")
@RequiredArgsConstructor
public class InspectorController {

    private final TicketService ticketService;

    @PostMapping("/check")
    public ResponseEntity<TicketCheckResponse> check(@Valid @RequestBody TicketCheckRequest request) {
        return ResponseEntity.ok(ticketService.checkTicket(request));
    }
}
