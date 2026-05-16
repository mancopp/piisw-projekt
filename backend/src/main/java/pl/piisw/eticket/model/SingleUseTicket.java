package pl.piisw.eticket.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import jakarta.persistence.*;

@Data
@Entity
@Table(name = "single_use_ticket")
@DiscriminatorValue("SINGLE")
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class SingleUseTicket extends Ticket {
    // Single-use ticket: Valid only after activation on a specific vehicle.
    // No additional fields needed beyond base Ticket (activatedAt, activatedVehicleId)
}
