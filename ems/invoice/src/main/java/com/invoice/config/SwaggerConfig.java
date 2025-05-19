package com.invoice.config;

import com.invoice.util.Constants;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.utils.SpringDocUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@Profile("!test")
public class SwaggerConfig {

    static {
        SpringDocUtils.getConfig().addFileType(MultipartFile.class);
    }

    @Bean
    public OpenAPI invoiceOpenApi() {
        return new OpenAPI()
                .info(new Info().title("Invoice REST API")
                        .description("Invoice REST API for managing invoices")
                        .version("v1.0.0")
                ).components(new Components()
                        // Add security schema for JWT
                        .addSecuritySchemes(Constants.AUTHORIZATION,
                                new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme(Constants.BEARER).bearerFormat(Constants.JWT))
                        // Add schema for multipart file
                        .addSchemas(Constants.MULTI_PART_FILE, new Schema<>()
                                .type(Constants.STRING)
                                .format(Constants.BINARY))
                )
                .externalDocs(new ExternalDocumentation()
                        .description("Invoice Application - Documentation")
                        .url("http://your-invoice-app-docs-url"));
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**").allowedMethods("HEAD", "GET", "PUT", "POST", "DELETE", "PATCH");
            }
        };
    }
}