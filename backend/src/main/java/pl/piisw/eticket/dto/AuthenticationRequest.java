package pl.piisw.eticket.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationRequest {
    @NotBlank(message = "email jest wymagany")
    @Email(message = "email musi być poprawnym adresem")
    private String email;

    @NotBlank(message = "hasło jest wymagane")
    private String password;
}
