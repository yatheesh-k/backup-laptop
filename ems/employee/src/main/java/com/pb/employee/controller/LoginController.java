package com.pb.employee.controller;

import com.pb.employee.request.*;
import com.pb.employee.util.Constants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@RestController
@RequestMapping("/")
public class LoginController {

    private final WebClient webClient;

    @Autowired
    public LoginController(WebClient.Builder webClientBuilder, @Value("${identity.service.baseUrl}") String baseUrl) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    @PostMapping("emsadmin/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            return webClient.post()
                    .uri(Constants.EMS_ADMIN_LOGIN)
                    .bodyValue(request)
                    .retrieve()
                    .toEntity(String.class)
                    .block();
        } catch (WebClientResponseException e) {
            return ResponseEntity.status(e.getRawStatusCode()).body(e.getResponseBodyAsString());
        }
    }

    @PatchMapping("emsadmin/login")
    public ResponseEntity<?> updatePassword(@RequestBody LoginRequest request) {
        try {
            return webClient.patch()
                    .uri(Constants.EMS_ADMIN_LOGIN)
                    .bodyValue(request)
                    .retrieve()
                    .toEntity(String.class)
                    .block();
        } catch (WebClientResponseException e) {
            return ResponseEntity.status(e.getRawStatusCode()).body(e.getResponseBodyAsString());
        }
    }

    @PostMapping("token/validate")
    public ResponseEntity<?> validateToken(@RequestBody ValidateLoginRequest request) {
        try {
            return webClient.post()
                    .uri(Constants.TOKEN_VALIDATE)
                    .bodyValue(request)
                    .retrieve()
                    .toEntity(String.class)
                    .block();
        } catch (WebClientResponseException e) {
            return ResponseEntity.status(e.getRawStatusCode()).body(e.getResponseBodyAsString());
        }
    }

    @PostMapping("company/login")
    public ResponseEntity<?> companyLogin(@RequestBody EmployeeLoginRequest request) {
        try {
            return webClient.post()
                    .uri(Constants.COMPANY_LOGIN)
                    .bodyValue(request)
                    .retrieve()
                    .toEntity(String.class)
                    .block();
        } catch (WebClientResponseException e) {
            return ResponseEntity.status(e.getRawStatusCode()).body(e.getResponseBodyAsString());
        }
    }

    @PostMapping("validate")
    public ResponseEntity<?> validateCompanyOtp(@RequestBody OTPRequest request) {
        try {
            return webClient.post()
                    .uri(Constants.VALIDATE)
                    .bodyValue(request)
                    .retrieve()
                    .toEntity(String.class)
                    .block();
        } catch (WebClientResponseException e) {
            return ResponseEntity.status(e.getRawStatusCode()).body(e.getResponseBodyAsString());
        }
    }

    @PostMapping("forgot/password")
    public ResponseEntity<?> forgotPassword(@RequestBody EmployeePasswordRequest request) {
        try {
            return webClient.post()
                    .uri(Constants.FORGOT_PASSWORD)
                    .bodyValue(request)
                    .retrieve()
                    .toEntity(String.class)
                    .block();
        } catch (WebClientResponseException e) {
            return ResponseEntity.status(e.getRawStatusCode()).body(e.getResponseBodyAsString());
        }
    }

    @PostMapping("update/password")
    public ResponseEntity<?> updatePassword(@RequestBody EmployeePasswordforgot request) {
        try {
            return webClient.post()
                    .uri(Constants.UPDATE_PASSWORD)
                    .bodyValue(request)
                    .retrieve()
                    .toEntity(String.class)
                    .block();
        } catch (WebClientResponseException e) {
            return ResponseEntity.status(e.getRawStatusCode()).body(e.getResponseBodyAsString());
        }
    }
}
