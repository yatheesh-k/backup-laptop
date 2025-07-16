package com.ems.accountant.controller;


import com.ems.accountant.common.ResponseBuilder;
import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.exception.ErrorMessageHandler;
import com.ems.accountant.exception.ErrorMessageKey;
import com.ems.accountant.persistance.PFResponseEntity;
import com.ems.accountant.request.PFResponseRequest;
import com.ems.accountant.request.PFResponseUpdateRequest;
import com.ems.accountant.service.PFResponseService;
import com.ems.accountant.utils.Constants;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Collection;

@Slf4j
@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/")
public class PFResponseController {

    @Autowired
    private PFResponseService pfResponseService;

    @RequestMapping(value = "{companyName}/pf/response", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.addPFResponse.tag}", description = "${api.addPFResponse.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description= "CREATED")
    public ResponseEntity<?> addPFResponse(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                               @RequestHeader(Constants.AUTH_KEY) String authToken,
                                               @PathVariable String companyName,
                                               @Parameter(required = true, description = "${api.addPFResponsePayload.description}")
                                               @RequestBody @Valid PFResponseRequest request) throws AccountantException {
        return pfResponseService.addPFResponse(companyName, request);
    }

    @RequestMapping(value = "{companyName}/pf/response/{responseId}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getPFResponseById.tag}", description = "${api.getPFResponseById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getPFResponse(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String responseId) throws AccountantException {
        Collection<PFResponseEntity> responseEntities = pfResponseService.getPFResponse(companyName, responseId, null, null);
        if (responseEntities.isEmpty()) {
            log.error("PF Response not found for company: {}, responseId: {}", companyName, responseId);
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.PF_RESPONSE_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(responseEntities), HttpStatus.OK);
    }


    @RequestMapping(value = "{companyName}/pf/response", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getPFResponse.tag}", description = "${api.getPFResponse.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getPFResponse(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName, @RequestParam(required = false) String month, @RequestParam(required = false) String year) {
        Collection<PFResponseEntity> pfResponseEntities =  pfResponseService.getPFResponse(companyName, null, month, year);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(pfResponseEntities), HttpStatus.OK);
    }

    @RequestMapping(value = "{companyName}/pf/response/{responseId}", method = RequestMethod.PATCH)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.updatePFResponse.tag}", description = "${api.updatePFResponse.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> updatePFResponse(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String responseId,
            @Valid @RequestBody PFResponseUpdateRequest updateRequest) throws AccountantException {
        return pfResponseService.updatePFResponse(companyName, responseId, updateRequest);
    }

    @RequestMapping(value = "{companyName}/pf/response/{responseId}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.deletePFResponseById.tag}", description = "${api.deletePFResponseById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> deletePFResponseById(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String responseId) throws AccountantException, IOException {

        pfResponseService.deletePFResponseById(companyName, responseId);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED),
                HttpStatus.OK
        );
    }
}
