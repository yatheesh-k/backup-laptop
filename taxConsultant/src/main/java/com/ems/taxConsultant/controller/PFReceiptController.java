package com.ems.taxConsultant.controller;

import com.ems.taxConsultant.common.ResponseBuilder;
import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.exception.ErrorMessageHandler;
import com.ems.taxConsultant.exception.ErrorMessageKey;
import com.ems.taxConsultant.persistance.PFReceiptsEntity;
import com.ems.taxConsultant.request.PFReceiptUpdateRequest;
import com.ems.taxConsultant.request.PFReceiptsRequest;
import com.ems.taxConsultant.service.PFReceiptsService;
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
public class PFReceiptController {

    @Autowired
    private PFReceiptsService pfReceiptsService;

    @RequestMapping(value = "{companyName}/pf/receipt", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.addPFReceipts.tag}", description = "${api.addPFReceipts.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description= "CREATED")
    public ResponseEntity<?> addPFReceipts(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                           @RequestHeader(Constants.AUTH_KEY) String authToken,
                                           @PathVariable String companyName,
                                           @Parameter(required = true, description = "${api.addPFResponsePayload.description}")
                                           @ModelAttribute @Valid PFReceiptsRequest request) throws AccountantException {
        return pfReceiptsService.addPFReceipts(companyName, request);
    }

    @RequestMapping(value = "{companyName}/pf/receipt/{receiptId}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getPfReceiptsById.tag}", description = "${api.getPfReceiptsById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getPfReceipts(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String receiptId, HttpServletRequest request) throws AccountantException {
        Collection<PFReceiptsEntity> receipts = pfReceiptsService.getPfReceipts(companyName, receiptId, null, null, request);
        if (receipts.isEmpty()) {
            log.error("PF Receipts not found for company: {}, receiptId: {}", companyName, receiptId);
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.PF_RECEIPTS_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(receipts), HttpStatus.OK);
    }


    @RequestMapping(value = "{companyName}/pf/receipt", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getPfReceipts.tag}", description = "${api.getPfReceipts.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getPfReceipts(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName, @RequestParam(required = false) String month, @RequestParam(required = false) String year, HttpServletRequest request) {
        Collection<PFReceiptsEntity> pfReceiptsEntities =  pfReceiptsService.getPfReceipts(companyName, null, month, year, request);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(pfReceiptsEntities), HttpStatus.OK);
    }

    @RequestMapping(value = "{companyName}/pf/receipt/{receiptId}", method = RequestMethod.PATCH)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.updatePFReceipt.tag}", description = "${api.updatePFReceipt.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> updatePFReceipt(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String receiptId,
            @Valid @RequestBody PFReceiptUpdateRequest updateRequest) throws AccountantException {
        return pfReceiptsService.updatePFReceipt(companyName, receiptId, updateRequest);
    }

    @RequestMapping(value = "{companyName}/pf/receipt/{receiptId}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.deletePFReceiptById.tag}", description = "${api.deletePFReceiptById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> deletePFReceiptById(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String receiptId) throws AccountantException, IOException {

        pfReceiptsService.deletePFReceiptById(companyName, receiptId);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED),
                HttpStatus.OK
        );
    }
}
