package pl.piisw.eticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketCheckResponse {
    private String ticketCode;
    private String status;
    private String reason;
    private Instant checkedAt;
}
