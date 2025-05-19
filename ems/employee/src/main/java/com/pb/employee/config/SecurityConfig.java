package com.pb.employee.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Configuring CORS, authentication, and authorization
        http.cors(corsConfigurer -> corsConfigurer.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.addAllowedOrigin("*");  // Allow all origins (adjust for security in production)
                    config.addAllowedMethod("*");  // Allow all HTTP methods (GET, POST, etc.)
                    config.addAllowedHeader("*");  // Allow all headers
                    return config;
                }))
                .authorizeRequests(authorizeRequestsConfigurer -> authorizeRequestsConfigurer
                        // Permit public access to the Swagger API and health check URLs
                        .requestMatchers("/**")
                        .permitAll()// Protect the other endpoints by requiring specific roles (company_admin or employee)
                        .requestMatchers("/**").hasAnyRole("company-admin","employee","ems_admin")  // Ensure role is prefixed with "ROLE_"
                        .anyRequest().authenticated())  // Require authentication for all other requests
                .csrf(csrf -> csrf.disable());  // Disable CSRF for stateless APIs (if necessary)

        return http.build();  // Final call to build the SecurityFilterChain
    }
}