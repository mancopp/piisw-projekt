package pl.piisw.eticket.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.piisw.eticket.dto.TicketActivationRequest;
import pl.piisw.eticket.dto.TicketActivationResponse;
import pl.piisw.eticket.service.TicketService;

@RestController
@RequestMapping("/api/v1/validator")
@RequiredArgsConstructor
public class ValidatorController {

    private final TicketService ticketService;

    @PostMapping("/activate")
    public ResponseEntity<TicketActivationResponse> activate(@Valid @RequestBody TicketActivationRequest request) {
        return ResponseEntity.ok(ticketService.activateTicket(request));
    }
}
