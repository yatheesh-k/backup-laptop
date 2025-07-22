package com.ems.taxConsultant.controller;

import com.ems.taxConsultant.common.ResponseBuilder;
import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.exception.ErrorMessageHandler;
import com.ems.taxConsultant.exception.ErrorMessageKey;
import com.ems.taxConsultant.persistance.GSTResponseEntity;
import com.ems.taxConsultant.request.GSTResponseRequest;
import com.ems.taxConsultant.request.GSTResponseUpdateRequest;
import com.ems.taxConsultant.service.GSTResponseService;
import com.ems.taxConsultant.utils.Constants;
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
public class GSTResponseController {


    @Autowired
    private GSTResponseService responseService;

    @RequestMapping(value = "{companyName}/gst/response", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.addGSTResponse.tag}", description = "${api.addTDSResponse.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description= "CREATED")
    public ResponseEntity<?> addGSTResponse(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                           @RequestHeader(Constants.AUTH_KEY) String authToken,
                                           @PathVariable String companyName,
                                           @Parameter(required = true, description = "${api.addTDSResponsePayload.description}")
                                           @RequestBody @Valid GSTResponseRequest request) throws AccountantException {
        return responseService.addGSTResponse(companyName, request);
    }

    @RequestMapping(value = "{companyName}/gst/response/{responseId}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getGSTResponseById.tag}", description = "${api.getGSTResponseById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getGSTResponse(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String responseId) throws AccountantException {
        Collection<GSTResponseEntity> responseEntities = responseService.getGSTResponse(companyName, responseId, null, null);
        if (responseEntities.isEmpty()) {
            log.error("GST Response not found for company: {}, responseId: {}", companyName, responseId);
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.GST_RESPONSE_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(responseEntities), HttpStatus.OK);
    }


    @RequestMapping(value = "{companyName}/gst/response", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getGSTResponse.tag}", description = "${api.getGSTResponse.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getGSTResponse(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName, @RequestParam(required = false) String month, @RequestParam(required = false) String year) {
        Collection<GSTResponseEntity> responseEntities =  responseService.getGSTResponse(companyName, null, month, year);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(responseEntities), HttpStatus.OK);
    }

    @RequestMapping(value = "{companyName}/gst/response/{responseId}", method = RequestMethod.PATCH)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.updateGSTResponse.tag}", description = "${api.updateGSTResponse.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> updateGSTResponse(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String responseId,
            @Valid @RequestBody GSTResponseUpdateRequest updateRequest) throws AccountantException {
        return responseService.updateGSTResponse(companyName, responseId, updateRequest);
    }

    @RequestMapping(value = "{companyName}/gst/response/{responseId}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.deleteGSTResponseById.tag}", description = "${api.deleteGSTResponseById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> deleteGSTResponseById(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String responseId) throws AccountantException, IOException {

        responseService.deleteGSTResponseById(companyName, responseId);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED),
                HttpStatus.OK
        );
    }
}
