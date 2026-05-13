package pl.piisw.eticket.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketOffer {
    private Long id;
    private String name;
    private TicketType ticketType;
    private FareType fareType;
    private Integer durationMinutes;
    private Integer validityDays;
    private BigDecimal price;
}