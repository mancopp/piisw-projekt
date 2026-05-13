package pl.piisw.eticket.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    private Long id;
    private AppUser user;
    private Ticket ticket;
    private BigDecimal amount;
    private String currency;
    private TransactionStatus status;
    private Instant createdAt;
}