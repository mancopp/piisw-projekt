package pl.piisw.eticket.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {
    private Long id;
    private AppUser user;
    private TicketOffer offer;
    private String code;
    private TicketStatus status;
    private Instant purchasedAt;
    private Instant activatedAt;
    private String activatedVehicleId;
    private Instant validFrom;
    private Instant validTo;
}