package com.ems.taxConsultant.controller;

import com.ems.taxConsultant.common.ResponseBuilder;
import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.persistance.DueDatesEntity;
import com.ems.taxConsultant.request.DueDatesRequest;
import com.ems.taxConsultant.request.TaxStatusResponse;
import com.ems.taxConsultant.service.DueDatesService;
import com.ems.taxConsultant.utils.Constants;
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
public class DueDatesController {


    @Autowired
    private DueDatesService dueDatesService;

    @RequestMapping(value = "{companyName}/dates", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.addDueDates.tag}", description = "${api.addDueDates.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description= "CREATED")
    public ResponseEntity<?> addDueDates(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                           @RequestHeader(Constants.AUTH_KEY) String authToken,
                                           @PathVariable String companyName,
                                           @Parameter(required = true, description = "${api.dueDatesPayload.description}")
                                           @RequestBody @Valid DueDatesRequest request) throws AccountantException {
        return dueDatesService.addDueDates(companyName, request);
    }

    @RequestMapping(value = "{companyName}/dates", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getDueDates.tag}", description = "${api.getDueDates.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getDueDates(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName) {
        Collection<DueDatesEntity> datesRequests = dueDatesService.getDueDates(companyName, null);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(datesRequests), HttpStatus.OK);
    }

    @RequestMapping(value = "{companyName}/date/{id}", method = RequestMethod.PATCH)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.updateDueDates.tag}", description = "${api.updateDueDates.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> updateDueDates(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String id,
            @Valid @RequestBody DueDatesRequest updateRequest) throws AccountantException {
        return dueDatesService.updateDueDates(companyName, id, updateRequest);
    }

    @RequestMapping(value = "{companyName}/dates/{id}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.deleteDueDatesById.tag}", description = "${api.deleteDueDatesById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> deleteTDSResponseById(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String id) throws AccountantException, IOException {

        dueDatesService.deleteDueDatesById(companyName, id);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED),
                HttpStatus.OK
        );
    }

    @RequestMapping(value = "{companyName}/taxStatus", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getTaxesStatus.tag}", description = "${api.getTaxesStatus.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getDueDatesValidation(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName, HttpServletRequest request) throws AccountantException {
        Collection<TaxStatusResponse> datesRequests = dueDatesService.getDueDatesValidation(companyName, request);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(datesRequests), HttpStatus.OK);
    }

}
