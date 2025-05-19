package com.pb.employee.config;

import com.pb.employee.request.ValidateLoginRequest;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.web.bind.annotation.*;

@FeignClient(url = "${identity.service.baseUrl}", name = "identity", configuration = FeignSslClientConfig.class)
public interface IRestIdentity {

    @PostMapping(value = "/token/validate", produces = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<Object> validateToken(@RequestBody ValidateLoginRequest payload);


}
