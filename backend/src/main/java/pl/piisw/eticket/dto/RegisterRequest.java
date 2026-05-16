package pl.piisw.eticket.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "email jest wymagany")
    @Email(message = "email musi być poprawnym adresem")
    private String email;

    @NotBlank(message = "hasło jest wymagane")
    @Size(min = 8, max = 72, message = "hasło musi mieć od 8 do 72 znaków")
    private String password;
}
