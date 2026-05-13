package pl.piisw.eticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.piisw.eticket.model.TransactionStatus;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private Long ticketId;
    private BigDecimal amount;
    private String currency;
    private TransactionStatus status;
    private Instant createdAt;
}