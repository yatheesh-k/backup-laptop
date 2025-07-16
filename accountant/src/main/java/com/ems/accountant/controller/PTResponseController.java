package com.ems.accountant.controller;

import com.ems.accountant.common.ResponseBuilder;
import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.exception.ErrorMessageHandler;
import com.ems.accountant.exception.ErrorMessageKey;
import com.ems.accountant.persistance.PTResponseEntity;
import com.ems.accountant.request.PTResponseRequest;
import com.ems.accountant.request.PTResponseUpdateRequest;
import com.ems.accountant.service.PTResponseService;
import com.ems.accountant.utils.Constants;
import io.swagger.v3.oas.annotations.Parameter;
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
public class PTResponseController {

    @Autowired
    private PTResponseService ptResponseService;

    @RequestMapping(value = "{companyName}/pt/response", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.addPTResponse.tag}", description = "${api.addPTResponse.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description= "CREATED")
    public ResponseEntity<?> addPTResponse(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                           @RequestHeader(Constants.AUTH_KEY) String authToken,
                                           @PathVariable String companyName,
                                           @Parameter(required = true, description = "${api.addPTResponsePayload.description}")
                                           @RequestBody @Valid PTResponseRequest responseRequest) throws AccountantException {
        return ptResponseService.addPTResponse(companyName, responseRequest);
    }

    @RequestMapping(value = "{companyName}/pt/response/{responseId}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getPTResponseById.tag}", description = "${api.getPTResponseById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getPTResponse(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String responseId) throws AccountantException {
        Collection<PTResponseEntity> responseEntities = ptResponseService.getPTResponse(companyName, responseId, null, null);
        if (responseEntities.isEmpty()) {
            log.error("PT Response not found for company: {}, responseId: {}", companyName, responseId);
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.PT_RESPONSE_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(responseEntities), HttpStatus.OK);
    }

    @RequestMapping(value = "{companyName}/pt/response", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getPTResponse.tag}", description = "${api.getPTResponse.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getPTResponse(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName, @RequestParam(required = false) String month, @RequestParam(required = false) String year) {
        Collection<PTResponseEntity> ptResponseEntities =  ptResponseService.getPTResponse(companyName, null, month, year);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(ptResponseEntities), HttpStatus.OK);
    }

    @RequestMapping(value = "{companyName}/pt/response/{responseId}", method = RequestMethod.PATCH)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.updatePTResponse.tag}", description = "${api.updatePTResponse.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> updatePTResponse(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String responseId,
            @Valid @RequestBody PTResponseUpdateRequest updateRequest) throws AccountantException {
        return ptResponseService.updatePTResponse(companyName, responseId, updateRequest);
    }

    @RequestMapping(value = "{companyName}/pt/response/{responseId}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.deletePTResponseById.tag}", description = "${api.deletePTResponseById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> deletePTResponseById(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String responseId) throws AccountantException, IOException {

        ptResponseService.deletePTResponseById(companyName, responseId);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED),
                HttpStatus.OK
        );
    }
}
