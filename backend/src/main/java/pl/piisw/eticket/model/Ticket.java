package pl.piisw.eticket.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import jakarta.persistence.*;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ticket")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "ticket_type", discriminatorType = DiscriminatorType.STRING)
public abstract class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private AppUser user;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private TicketOffer offer;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    @Column(name = "purchased_at", nullable = false)
    private Instant purchasedAt;

    @Column(name = "activated_at")
    private Instant activatedAt;

    @Column(name = "activated_vehicle_id")
    private String activatedVehicleId;
}
