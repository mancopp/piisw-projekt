package pl.piisw.eticket.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import jakarta.persistence.*;

import java.time.Instant;

@Data
@Entity
@Table(name = "period_ticket")
@DiscriminatorValue("PERIOD")
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class PeriodTicket extends Ticket {
    @Column(name = "valid_from", nullable = false)
    private Instant validFrom;

    @Column(name = "valid_to", nullable = false)
    private Instant validTo;
}
