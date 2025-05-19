package com.pb.ems.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
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

  public static final String EMPLOYEE_TAG = "employee";

  static{
    SpringDocUtils.getConfig().addFileType(MultipartFile.class);
  }

  @Bean
  public OpenAPI emsOpenApi() {
    return new OpenAPI()
            .info(new Info().title("EMS REST API")
                    .description("EMS REST API")
                    .version("v1.0.0")
            ).components(new Components()
                    .addSecuritySchemes("Authorization",
                            new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("Bearer").bearerFormat("JWT")))
            .externalDocs(new ExternalDocumentation()
                    .description("PathBreaker - Website")
                    .url("#"));
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
