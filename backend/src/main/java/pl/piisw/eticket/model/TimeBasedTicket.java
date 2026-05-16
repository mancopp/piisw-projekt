package pl.piisw.eticket.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import jakarta.persistence.*;

@Data
@Entity
@Table(name = "time_based_ticket")
@DiscriminatorValue("TIME")
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class TimeBasedTicket extends Ticket {
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;
}
