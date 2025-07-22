package com.ems.taxConsultant.controller;

import com.ems.taxConsultant.common.ResponseBuilder;
import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.exception.ErrorMessageHandler;
import com.ems.taxConsultant.exception.ErrorMessageKey;
import com.ems.taxConsultant.persistance.TDSReceiptEntity;
import com.ems.taxConsultant.request.TDSReceiptRequest;
import com.ems.taxConsultant.request.TDSReceiptUpdateRequest;
import com.ems.taxConsultant.service.TDSReceiptsService;
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
public class TDSReceiptController {

    @Autowired
    private TDSReceiptsService tdsReceiptsService;

    @RequestMapping(value = "{companyName}/tds/receipt", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.addTDSReceipts.tag}", description = "${api.addTDSReceipts.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "CREATED")
    public ResponseEntity<?> addTDSReceipt(@RequestHeader(Constants.AUTH_KEY) @Parameter(hidden = true) String authToken,
                                           @PathVariable String companyName,
                                           @Parameter(required = true, description = "${api.addTDSReceiptsPayload.description}")
                                           @ModelAttribute @Valid TDSReceiptRequest request) throws AccountantException {
        return tdsReceiptsService.addTDSReceipt(companyName, request);
    }

    @RequestMapping(value = "{companyName}/tds/receipt", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getTDSReceipts.tag}", description = "${api.getTDSReceipts.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getTDSReceipts(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName, @RequestParam(required = false) String month, @RequestParam(required = false) String year, HttpServletRequest request) {
        Collection<TDSReceiptEntity> tdsReceiptEntities =  tdsReceiptsService.getTDSReceipts(companyName, null, month, year, request);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(tdsReceiptEntities), HttpStatus.OK);
    }

    @RequestMapping(value = "{companyName}/tds/receipt/{tdsReceiptsId}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getTDSReceiptsById.tag}", description = "${api.getTDSReceiptsById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getTDSReceipts(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String tdsReceiptsId, HttpServletRequest request) throws AccountantException {
        Collection<TDSReceiptEntity> receipts = tdsReceiptsService.getTDSReceipts(companyName, tdsReceiptsId, null, null, request);
        if (receipts.isEmpty()) {
            log.error("Professional tax Receipts not found for company: {}, receiptId: {}", companyName, tdsReceiptsId);
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.TDS_RECEIPTS_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(receipts), HttpStatus.OK);
    }

    @RequestMapping(value = "{companyName}/tds/receipt/{tdsReceiptsId}", method = RequestMethod.PATCH)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.updateTDSReceipt.tag}", description = "${api.updateTDSReceipt.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> updateTDSReceipt(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String tdsReceiptsId,
            @Valid @RequestBody TDSReceiptUpdateRequest updateRequest) throws AccountantException {
        return tdsReceiptsService.updateTDSReceipt(companyName, tdsReceiptsId, updateRequest);
    }

    @RequestMapping(value = "{companyName}/tds/receipt/{tdsReceiptsId}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.deleteTDSReceiptById.tag}", description = "${api.deleteTDSReceiptById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> deleteTDSReceiptById(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String tdsReceiptsId) throws AccountantException, IOException {

        tdsReceiptsService.deleteTDSReceiptById(companyName, tdsReceiptsId);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED),
                HttpStatus.OK
        );
    }
}
