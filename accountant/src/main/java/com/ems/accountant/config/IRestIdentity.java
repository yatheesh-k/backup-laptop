package com.ems.accountant.config;

import com.ems.accountant.request.ValidateLoginRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(url = "${identity.service.baseUrl}", name = "identity", configuration = FeignSslClientConfig.class)
public interface IRestIdentity {

    @PostMapping(value = "/token/validate", produces = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<Object> validateToken(@RequestBody ValidateLoginRequest payload);


}
