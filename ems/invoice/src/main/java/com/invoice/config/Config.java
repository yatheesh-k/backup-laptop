package com.invoice.config;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import java.math.BigDecimal;

@Setter
@Getter
@Configuration
@ConfigurationProperties(prefix = "gst")
public class Config {

    private BigDecimal rate;
    private BigDecimal value;
    private BigDecimal percent;
}
