package com.ems.taxConsultant.controller;

import com.ems.taxConsultant.common.ResponseBuilder;
import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.exception.ErrorMessageHandler;
import com.ems.taxConsultant.exception.ErrorMessageKey;
import com.ems.taxConsultant.persistance.PTReceiptEntity;
import com.ems.taxConsultant.request.PTReceiptRequest;
import com.ems.taxConsultant.request.PTReceiptUpdateRequest;
import com.ems.taxConsultant.service.PTReceiptService;
import com.ems.taxConsultant.utils.Constants;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Collection;

@Slf4j
@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/")
public class PTReceiptController {

    @Autowired
    private PTReceiptService ptReceiptService;

    @RequestMapping(value = "{companyName}/pt/receipt", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.addPTReceipts.tag}", description = "${api.addPTReceipts.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description= "CREATED")
    public ResponseEntity<?> addPTReceipts(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                           @RequestHeader(Constants.AUTH_KEY) String authToken,
                                           @PathVariable String companyName,
                                           @Parameter(required = true, description = "${api.addPTReceiptsPayload.description}")
                                           @ModelAttribute @Valid PTReceiptRequest request) throws TaxConsultantException {
        return ptReceiptService.addPTReceipts(companyName, request);
    }

    @RequestMapping(value = "{companyName}/pt/receipt/{receiptId}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getPTReceiptsById.tag}", description = "${api.getPTReceiptsById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getPTReceipts(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String receiptId, HttpServletRequest request) throws TaxConsultantException {
        Collection<PTReceiptEntity> receipts = ptReceiptService.getPTReceipts(companyName, receiptId, null, null, request);
        if (receipts.isEmpty()) {
            log.error("Professional tax Receipts not found for company: {}, receiptId: {}", companyName, receiptId);
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.PT_RECEIPTS_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(receipts), HttpStatus.OK);
    }


    @RequestMapping(value = "{companyName}/pt/receipt", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getPTReceipts.tag}", description = "${api.getPTReceipts.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getPTReceipts(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName, @RequestParam(required = false) String month, @RequestParam(required = false) String year, HttpServletRequest request) {
        Collection<PTReceiptEntity> ptReceiptEntities =  ptReceiptService.getPTReceipts(companyName, null, month, year, request);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(ptReceiptEntities), HttpStatus.OK);
    }

    @RequestMapping(value = "{companyName}/pt/receipt/{receiptId}", method = RequestMethod.PATCH)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.updatePTReceipt.tag}", description = "${api.updatePTReceipt.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> updatePTReceipt(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String receiptId,
            @Valid @RequestBody PTReceiptUpdateRequest updateRequest) throws TaxConsultantException {
        return ptReceiptService.updatePTReceipt(companyName, receiptId, updateRequest);
    }

    @RequestMapping(value = "{companyName}/pt/receipt/{receiptId}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.deletePTReceiptById.tag}", description = "${api.deletePTReceiptById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> deletePTReceiptById(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String receiptId) throws TaxConsultantException, IOException {

        ptReceiptService.deletePTReceiptById(companyName, receiptId);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED),
                HttpStatus.OK
        );
    }
}
