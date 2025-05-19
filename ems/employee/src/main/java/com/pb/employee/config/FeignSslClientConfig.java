package com.pb.employee.config;

import feign.Client;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.conn.ssl.TrustSelfSignedStrategy;
import org.apache.http.ssl.SSLContexts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;

import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocketFactory;

/**
 * @author
 * sets the ssl certifacte to be used for calling other services running on https
 */
public class FeignSslClientConfig {
    @Autowired
    private FeignConfig feignConfig;

    @Bean
    public Client feignClient() {
        Client trustSSLSockets = new Client.Default(getSSLSocketFactory(), new NoopHostnameVerifier());
        return trustSSLSockets;
    }

    private SSLSocketFactory getSSLSocketFactory() {
        try {
            /*TrustStrategy acceptingTrustStrategy = new TrustStrategy() {
                @Override
                public boolean isTrusted(X509Certificate[] chain, String authType) throws CertificateException {
                    //Do your validations
                    return true;
                }
            };
            String allPassword = feignConfig.getSslCertPassword();
            SSLContext sslContext = SSLContextBuilder
                    .create()
                    .loadKeyMaterial(ResourceUtils.getFile(feignConfig.getSslCaCertFilePath()), allPassword.toCharArray(), allPassword.toCharArray())
                    .loadTrustMaterial(ResourceUtils.getFile(feignConfig.getSslCaCertFilePath()), allPassword.toCharArray())
                    .build();
            return sslContext.getSocketFactory();*/
            SSLContext sslContext = SSLContexts.custom().loadTrustMaterial(null, new TrustSelfSignedStrategy()).build();
            return sslContext.getSocketFactory();
        } catch (Exception exception) {
            throw new RuntimeException(exception);
        }
    }
}
