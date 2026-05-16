package pl.piisw.eticket.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI eticketOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("eTicket API")
                        .description("API do obsługi biletów i transakcji")
                        .version("v1"));
    }
}
