package it.unical.webapp.angulargoldenstaybackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Origini ammesse configurabili da variabile d'ambiente, al posto dei
 * {@code @CrossOrigin("http://localhost:4200")} fissi sui controller: in
 * locale serve solo Angular in sviluppo, in produzione anche il frontend
 * pubblicato su Vercel.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    // Il default copre chi non ha ancora la proprietà nel proprio
    // application.properties locale (il file non è nel repository).
    @Value("${app.cors.allowed-origins:http://localhost:4200}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins.split(","))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
