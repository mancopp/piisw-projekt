package pl.piisw.eticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.piisw.eticket.model.TicketStatus;
import pl.piisw.eticket.model.TicketType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketPurchaseResponse {
    private Long ticketId;
    private String code;
    private TicketStatus status;
    private TicketType ticketType;
}