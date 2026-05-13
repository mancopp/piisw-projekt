package pl.piisw.eticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.piisw.eticket.model.FareType;
import pl.piisw.eticket.model.TicketStatus;
import pl.piisw.eticket.model.TicketType;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private Long id;
    private String code;
    private TicketType ticketType;
    private FareType fareType;
    private TicketStatus status;
    private Instant purchasedAt;
    private Instant activatedAt;
    private String activatedVehicleId;
    private Instant validFrom;
    private Instant validTo;
}