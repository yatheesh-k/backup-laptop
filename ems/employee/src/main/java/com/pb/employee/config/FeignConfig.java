package com.pb.employee.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * @author srokade
 * Config class for setting and getting ssl certificate configurations
 */
@Component
@ConfigurationProperties(prefix="feign")
public class FeignConfig {
    private String sslCertPassword;
    private String sslCaCertFilePath;

    public String getSslCaCertFilePath() {
        return sslCaCertFilePath;
    }

    public void setSslCaCertFilePath(String sslCaCertFilePath) {
        this.sslCaCertFilePath = sslCaCertFilePath;
    }

    public String getSslCertPassword() {
        return sslCertPassword;
    }

    public void setSslCertPassword(String sslCertPassword) {
        this.sslCertPassword = sslCertPassword;
    }
}
