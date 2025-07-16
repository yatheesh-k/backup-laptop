package com.ems.accountant.config;

import com.ems.accountant.utils.Constants;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Maps "/assets/img/**" URL path to the "D:/ems/ui/public/assets/img/" directory
        registry.addResourceHandler(Constants.PATH_PATTERN)
                .addResourceLocations(Constants.FILE_STORED_PATH);
    }

}
