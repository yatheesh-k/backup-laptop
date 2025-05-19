package com.invoice.controller;

import com.invoice.exception.InvoiceException;
import com.invoice.request.CustomerRequest;
import com.invoice.request.CustomerUpdateRequest;
import com.invoice.service.CustomerService;
import com.invoice.util.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @PostMapping("company/{companyId}/customer")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.createCustomer.tag}", description = "${api.createCustomer.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Customer created successfully")
    public ResponseEntity<?> createCustomer(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                            @RequestHeader(Constants.AUTH_KEY) String authToken,
                                            @Parameter(required = true, description = "${api.createCustomerPayload.description}")
                                            @PathVariable String companyId,
                                            @RequestBody @Valid CustomerRequest customerRequest) throws InvoiceException,IOException {
        return customerService.createCustomer(companyId,customerRequest);
    }

    @GetMapping("company/{companyId}/customer/all")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.getCustomer.tag}", description = "${api.getCustomer.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "${api.createCustomerPayload.description}")
    public ResponseEntity<?> getCustomer(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                         @RequestHeader(Constants.AUTH_KEY) String authToken,
                                         @PathVariable String companyId) throws InvoiceException,IOException {
        return customerService.getCustomers(companyId);
    }

    @GetMapping("company/{companyId}/customer/{customerId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.getAllCustomers.tag}", description = "${api.getAllCustomers.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "${api.createCustomerPayload.description}")
    public ResponseEntity<?> getCustomerById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                             @RequestHeader(Constants.AUTH_KEY) String authToken,
                                             @PathVariable String companyId,
                                             @PathVariable String customerId) throws InvoiceException,IOException {
        return customerService.getCustomerById(companyId,customerId);
    }

    @PatchMapping("company/{companyId}/customer/{customerId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.updateCustomer.tag}", description = "${api.updateCustomer.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "${api.createCustomerPayload.description}")
    public ResponseEntity<?> updateCustomer(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                @RequestHeader(Constants.AUTH_KEY) String authToken,
                                            @PathVariable String companyId,
                                            @PathVariable String customerId,
                                            @RequestBody @Valid CustomerUpdateRequest customerRequest) throws InvoiceException, IOException {
        return customerService.updateCustomer(companyId,customerId, customerRequest);
    }

    @DeleteMapping("company/{companyId}/customer/{customerId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.deleteCustomer.tag}", description = "${api.deleteCustomer.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Customer deleted successfully")
    public ResponseEntity<?> deleteCustomer(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                            @RequestHeader(Constants.AUTH_KEY) String authToken,
                                            @PathVariable String companyId,
                                            @PathVariable String customerId) throws InvoiceException,IOException {
        return customerService.deleteCustomer(companyId,customerId);
    }
}
