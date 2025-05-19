package com.invoice.config;

import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.core.env.Environment;

@Configuration
@PropertySource(value = {"classpath:invoice-error.properties", "classpath:application-operation.properties"})
public class AppEnvironment implements EnvironmentAware {

    public static Environment environment;

    @Override
    public void setEnvironment(Environment environment) {
        AppEnvironment.environment = environment;
    }

    @Bean
    public static PropertySourcesPlaceholderConfigurer propertyConfigInDev() {
        return new PropertySourcesPlaceholderConfigurer();
    }
}

