package com.pb.employee.config;

import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.tcp.TcpClient;

import javax.net.ssl.SSLException;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(createHttpClient()));
    }

    private HttpClient createHttpClient() {
        try {
            // Create an SslContext with an insecure trust manager for development
            SslContextBuilder sslContextBuilder = SslContextBuilder.forClient()
                    .trustManager(InsecureTrustManagerFactory.INSTANCE);

            // Build the HttpClient with the custom SslContext
            TcpClient tcpClient = TcpClient.create()
                    .secure(spec -> {
                        try {
                            spec.sslContext(sslContextBuilder.build());
                        } catch (SSLException e) {
                            throw new RuntimeException(e);
                        }
                    });

            return HttpClient.from(tcpClient);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create SSL context", e);
        }
    }
}
