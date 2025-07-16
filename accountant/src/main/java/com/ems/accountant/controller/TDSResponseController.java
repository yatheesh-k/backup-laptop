package com.ems.accountant.controller;

import com.ems.accountant.common.ResponseBuilder;
import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.exception.ErrorMessageHandler;
import com.ems.accountant.exception.ErrorMessageKey;
import com.ems.accountant.persistance.TDSResponseEntity;
import com.ems.accountant.request.TDSResponseRequest;
import com.ems.accountant.request.TDSResponseUpdateRequest;
import com.ems.accountant.service.TDSResponseService;
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
public class TDSResponseController {

    @Autowired
    private TDSResponseService responseService;

    @RequestMapping(value = "{companyName}/tds/response", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.addTDSResponse.tag}", description = "${api.addTDSResponse.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description= "CREATED")
    public ResponseEntity<?> addPFResponse(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                           @RequestHeader(Constants.AUTH_KEY) String authToken,
                                           @PathVariable String companyName,
                                           @Parameter(required = true, description = "${api.addTDSResponsePayload.description}")
                                           @RequestBody @Valid TDSResponseRequest request) throws AccountantException {
        return responseService.addTDSResponse(companyName, request);
    }

    @RequestMapping(value = "{companyName}/tds/response/{responseId}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getTDSResponseById.tag}", description = "${api.getTDSResponseById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getTDSResponse(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String responseId) throws AccountantException {
        Collection<TDSResponseEntity> responseEntities = responseService.getTDSResponse(companyName, responseId, null, null);
        if (responseEntities.isEmpty()) {
            log.error("PF Response not found for company: {}, responseId: {}", companyName, responseId);
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.TDS_RESPONSE_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(responseEntities), HttpStatus.OK);
    }


    @RequestMapping(value = "{companyName}/tds/response", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getTDSResponse.tag}", description = "${api.getTDSResponse.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getPFResponse(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName, @RequestParam(required = false) String month, @RequestParam(required = false) String year) {
        Collection<TDSResponseEntity> responseEntities =  responseService.getTDSResponse(companyName, null, month, year);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(responseEntities), HttpStatus.OK);
    }

    @RequestMapping(value = "{companyName}/tds/response/{responseId}", method = RequestMethod.PATCH)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.updateTDSResponse.tag}", description = "${api.updateTDSResponse.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> updateTDSResponse(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String responseId,
            @Valid @RequestBody TDSResponseUpdateRequest updateRequest) throws AccountantException {
        return responseService.updateTDSResponse(companyName, responseId, updateRequest);
    }

    @RequestMapping(value = "{companyName}/tds/response/{responseId}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.deleteTDSResponseById.tag}", description = "${api.deleteTDSResponseById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> deleteTDSResponseById(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String responseId) throws AccountantException, IOException {

        responseService.deleteTDSResponseById(companyName, responseId);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED),
                HttpStatus.OK
        );
    }
}
