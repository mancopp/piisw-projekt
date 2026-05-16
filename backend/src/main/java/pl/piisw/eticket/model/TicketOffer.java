package pl.piisw.eticket.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ticket_offer")
public class TicketOffer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "ticket_type", nullable = false)
    private TicketType ticketType;

    @Enumerated(EnumType.STRING)
    @Column(name = "fare_type", nullable = false)
    private FareType fareType;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "validity_days")
    private Integer validityDays;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
}
