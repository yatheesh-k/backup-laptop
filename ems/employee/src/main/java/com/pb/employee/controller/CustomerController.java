package com.pb.employee.controller;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.*;
import com.pb.employee.service.CustomerService;
import com.pb.employee.util.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.io.IOException;

@RestController
@RequestMapping("/")
public class CustomerController {

    @Autowired
    private  CustomerService customerService;

    @PostMapping("company/{companyId}/customer")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.createCustomer.tag}", description = "${api.getCustomer.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "${api.createCustomer.description}")
    public ResponseEntity<?> createCustomer(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                    @RequestHeader(Constants.AUTH_KEY) String authToken,
                                    @Parameter(required = true, description = "${api.createCompanyPayload.description}")
                                    @PathVariable String companyId,
                                    @RequestBody @Valid CustomerRequest request) {
       return customerService.createCustomer(companyId,request,authToken);
    }

    @GetMapping("company/{companyId}/customer/all")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) }, summary = "${api.getAllCustomers.tag}", description = "${api.getCustomer.description}")
    @ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getCompanyByIdCustomer( @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                          @RequestHeader(Constants.AUTH_KEY) String authToken,
                                          @Parameter(required = true, description = "${api.getAllCompanyPayload.description}")
                                          @PathVariable String companyId){
        return customerService.getCompanyByIdCustomer(companyId,authToken);
    }

    @GetMapping("company/{companyId}/customer/{customerId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.getCustomer.tag}", description = "${api.getAllCustomers.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "${api.getACustomersPayload.description}")
    public ResponseEntity<?> getCustomerById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                             @RequestHeader(Constants.AUTH_KEY) String authToken,
                                             @Parameter(required = true, description = "${api.getCompanyPayload.description}")
                                             @PathVariable String companyId,
                                             @Parameter(required = true, description = "${api.getCustomerPayload.description}")
                                             @PathVariable String customerId) {
        return customerService.getCustomerById(companyId,customerId,authToken);
    }

    @PatchMapping("company/{companyId}/customer/{customerId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.updateCustomer.tag}", description = "${api.updateCustomer.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "${api.updateCustomerPayload.description}")
    public ResponseEntity<?> updateCustomer(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                            @RequestHeader(Constants.AUTH_KEY) String authToken,
                                            @Parameter(required = true, description = "${api.updateCompanyPayload.description}")
                                            @PathVariable String companyId,
                                            @Parameter(required = true, description = "${api.updateCustomerPayload.description}")
                                            @PathVariable String customerId,
                                            @RequestBody @Valid CustomerUpdateRequest customerRequest) {
        return customerService.updateCustomer(authToken,companyId,customerId, customerRequest);
    }

    @DeleteMapping("company/{companyId}/customer/{customerId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.deleteCustomer.tag}", description = "${api.deleteCustomer.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> deleteCustomer(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                            @RequestHeader(Constants.AUTH_KEY) String authToken,
                                            @Parameter(required = true, description = "${api.deleteCompanyPayload.description}")
                                            @PathVariable String companyId,
                                            @Parameter(required = true, description = "${api.deleteCustomerPayload.description}")
                                            @PathVariable String customerId){
        return customerService.deleteCustomer(authToken,companyId,customerId);
    }
}
