package com.invoice.controller;

import com.invoice.exception.InvoiceException;
import com.invoice.request.InvoiceRequest;
import com.invoice.service.InvoiceService;
import com.invoice.util.Constants;
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
                                             @PathVariable String customerId,
                                             @RequestBody @Valid InvoiceRequest invoiceRequest) throws InvoiceException, IOException {
        return invoiceService.generateInvoice(companyId,customerId,invoiceRequest);
    }

    @GetMapping("company/{companyId}/invoice")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.getInvoice.tag}", description = "${api.getInvoice.description}")
    @ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getCompanyAllInvoices(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                   @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                   @Parameter(required = true, description = "${api.createCompanyPayload.description}")
                                                   @PathVariable String companyId,
                                                   @RequestParam(required = false,name = Constants.CUSTOMER_ID) String customerId,
                                                   HttpServletRequest request) throws InvoiceException {
        return invoiceService.getCompanyAllInvoices(companyId,customerId,request);
    }

    @GetMapping("company/{companyId}/customer/{customerId}/invoice/{invoiceId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.getInvoice.tag}", description = "${api.getInvoice.description}")
    @ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getInvoiceById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                            @RequestHeader(Constants.AUTH_KEY) String authToken,
                                            @Parameter(required = true, description = "${api.createCompanyPayload.description}")
                                            @PathVariable String companyId,
                                            @Parameter(required = true, description = "${api.createCustomerPayload.description}")
                                            @PathVariable String customerId,
                                            @Parameter(required = true, description = "${api.createInvoicePayload.description}")
                                            @PathVariable String invoiceId,
                                            HttpServletRequest request) throws InvoiceException, IOException {
        return invoiceService.getInvoiceById(companyId,customerId,invoiceId,request);
    }


    @GetMapping("company/{companyId}/customer/{customerId}/downloadInvoice/{invoiceId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.getInvoice.tag}", description = "${api.getInvoice.description}")
    @ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> downloadInvoice(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                             @RequestHeader(Constants.AUTH_KEY) String authToken,
                                             @Parameter(required = true, description = "${api.createCompanyPayload.description}")
                                             @PathVariable String companyId,
                                             @Parameter(required = true, description = "${api.createCustomerPayload.description}")
                                             @PathVariable String customerId,
                                             @Parameter(required = true, description = "${api.createInvoicePayload.description}")
                                             @PathVariable String invoiceId, HttpServletRequest request) throws Exception {
        return invoiceService.downloadInvoice(companyId,customerId,invoiceId,request);
    }
}