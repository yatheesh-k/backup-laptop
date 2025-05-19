package com.pb.employee.controller;


import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.InvoiceRequest;
import com.pb.employee.service.InvoiceService;
import com.pb.employee.util.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @PostMapping("company/{companyId}/customer/{customerId}/invoice")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.createInvoice.tag}", description = "${api.createInvoice.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @ApiResponse(responseCode = "201", description = "CREATED")
    public ResponseEntity<?> generateInvoice(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                         @RequestHeader(Constants.AUTH_KEY) String authToken,
                                         @Parameter(required = true, description = "${api.createCompanyPayload.description}")
                                         @PathVariable String companyId,
                                         @Parameter(required = true, description = "${api.createCustomerPayload.description}")
                                         @PathVariable String customerId,
                                         @RequestBody @Valid InvoiceRequest invoiceRequest) throws  EmployeeException {
        return invoiceService.generateInvoice(authToken,companyId,customerId,invoiceRequest);
    }

    @GetMapping("company/{companyId}/customer/{customerId}/invoice/{invoiceId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.getInvoice.tag}", description = "${api.getInvoice.description}")
    @ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getInvoiceById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                            @RequestHeader(Constants.AUTH_KEY) String authToken,
                                            @Parameter(required = true, description = "${api.getCompanyPayload.description}")
                                            @PathVariable String companyId,
                                            @Parameter(required = true, description = "${api.getCustomerPayload.description}")
                                            @PathVariable String customerId,
                                            @Parameter(required = true, description = "${api.getInvoicePayload.description}")
                                            @PathVariable String invoiceId) throws EmployeeException {
        return invoiceService.getInvoiceById(authToken,companyId,customerId,invoiceId);
    }


    @GetMapping("company/{companyId}/invoice")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.getCompanyAllInvoices.tag}", description = "${api.getInvoice.description}")
    @ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getCompanyAllInvoices(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                    @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                    @Parameter(required = true, description = "${api.getCompanyPayload.description}")
                                                    @PathVariable String companyId,
                                                    @RequestParam(required = false,name = Constants.CUSTOMER_ID) String customerId
                                                    ) throws EmployeeException {
        return invoiceService.getCompanyAllInvoices(authToken,companyId,customerId);
    }

    @GetMapping("company/{companyId}/customer/{customerId}/downloadInvoice/{invoiceId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.downloadInvoice.tag}", description = "${api.detInvoice.description}")
    @ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> downloadInvoice(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                             @RequestHeader(Constants.AUTH_KEY) String authToken,
                                             @Parameter(required = true, description = "${api.getCompanyPayload.description}")
                                             @PathVariable String companyId,
                                             @Parameter(required = true, description = "${api.getCustomerPayload.description}")
                                             @PathVariable String customerId,
                                             @Parameter(required = true, description = "${api.getInvoicePayload.description}")
                                             @PathVariable String invoiceId,HttpServletRequest request) throws EmployeeException {
        return invoiceService.downloadInvoice(authToken,companyId,customerId,invoiceId,request);
    }
}
