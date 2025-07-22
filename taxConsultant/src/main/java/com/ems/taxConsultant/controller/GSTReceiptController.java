package com.ems.taxConsultant.controller;

import com.ems.taxConsultant.common.ResponseBuilder;
import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.exception.ErrorMessageHandler;
import com.ems.taxConsultant.exception.ErrorMessageKey;
import com.ems.taxConsultant.persistance.GSTReceiptEntity;
import com.ems.taxConsultant.request.GSTReceiptRequest;
import com.ems.taxConsultant.request.GSTReceiptUpdateRequest;
import com.ems.taxConsultant.service.GSTReceiptService;
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
public class GSTReceiptController {

    @Autowired
    private GSTReceiptService gstReceiptService;

    @RequestMapping(value = "{companyName}/gst/receipt", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.addGSTReceipts.tag}", description = "${api.addGSTReceipts.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description= "CREATED")
    public ResponseEntity<?> addGSTReceipts(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                           @RequestHeader(Constants.AUTH_KEY) String authToken,
                                           @PathVariable String companyName,
                                           @Parameter(required = true, description = "${api.addGSTReceiptPayload.description}")
                                           @ModelAttribute @Valid GSTReceiptRequest request) throws AccountantException {
        return gstReceiptService.addGstReceipts(companyName, request);
    }

    @RequestMapping(value = "{companyName}/gst/receipt/{receiptId}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getGSTReceiptsById.tag}", description = "${api.getGSTReceiptsById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getGSTReceipts(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String receiptId, HttpServletRequest request) throws AccountantException {
        Collection<GSTReceiptEntity> receipts = gstReceiptService.getGstReceipts(companyName, receiptId, null, null, request);
        if (receipts.isEmpty()) {
            log.error("GST Receipts not found for company: {}, receiptId: {}", companyName, receiptId);
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.GST_RECEIPTS_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(receipts), HttpStatus.OK);
    }


    @RequestMapping(value = "{companyName}/gst/receipt", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getGSTReceipts.tag}", description = "${api.getGSTReceipts.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getGSTReceipts(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName, @RequestParam(required = false) String month, @RequestParam(required = false) String year, HttpServletRequest request) {
        Collection<GSTReceiptEntity> gstReceiptsEntities =  gstReceiptService.getGstReceipts(companyName, null, month, year, request);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(gstReceiptsEntities), HttpStatus.OK);
    }

    @RequestMapping(value = "{companyName}/gst/receipt/{receiptId}", method = RequestMethod.PATCH)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.updateGSTReceipt.tag}", description = "${api.updateGSTReceipt.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> updateGSTReceipt(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String receiptId,
            @Valid @RequestBody GSTReceiptUpdateRequest updateRequest) throws AccountantException {
        return gstReceiptService.updateGstReceipt(companyName, receiptId, updateRequest);
    }

    @RequestMapping(value = "{companyName}/gst/receipt/{receiptId}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.deleteGSTReceiptById.tag}", description = "${api.deleteGSTReceiptById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> deleteGSTReceiptById(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String receiptId) throws AccountantException, IOException {

        gstReceiptService.deleteGstReceiptById(companyName, receiptId);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED),
                HttpStatus.OK
        );
    }

}
