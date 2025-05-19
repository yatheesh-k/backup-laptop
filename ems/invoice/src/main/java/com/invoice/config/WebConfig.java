package com.invoice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Maps "/assets/img/**" URL path to the "D:/ems/ui/public/assets/img/" directory
        registry.addResourceHandler("/var/www/ems/assets/img/**")
                .addResourceLocations("file:/var/www/ems/assets/img/");
    }
}
