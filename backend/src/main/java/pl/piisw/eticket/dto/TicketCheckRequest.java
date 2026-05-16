package pl.piisw.eticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketCheckRequest {
    @NotBlank
    private String ticketCode;

    @NotBlank
    private String vehicleId;

    @NotNull
    private Instant controlTime;
}
