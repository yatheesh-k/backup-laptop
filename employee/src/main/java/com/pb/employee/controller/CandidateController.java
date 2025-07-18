package com.pb.employee.controller;

import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.CandidateEntity;
import com.pb.employee.persistance.model.CompanyCalendarEntity;
import com.pb.employee.request.CandidatePayload.CandidateRequest;
import com.pb.employee.request.CandidatePayload.CandidateUpdateRequest;
import com.pb.employee.service.CandidateService;
import com.pb.employee.util.Constants;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Collection;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/")
public class CandidateController {

    @Autowired
    private CandidateService candidateService;


    @RequestMapping(value = "candidate", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.registerCandidate.tag}", description = "${api.registerCandidate.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description= "CREATED")
    public ResponseEntity<?> registerCandidate(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                              @RequestHeader(Constants.AUTH_KEY) String authToken,
                                              @Parameter(required = true, description = "${api.registerCandidatePayload.description}")
                                              @RequestBody @Valid CandidateRequest candidateRequest,
                                              HttpServletRequest request) throws EmployeeException, IOException {
        return candidateService.registerCandidate(candidateRequest,request);
    }

    @RequestMapping(value = "candidate/{companyName}/{candidateId}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getCandidateById.tag}", description = "${api.getCandidateById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getCandidate(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String candidateId) throws EmployeeException, IOException {
        Collection<CandidateEntity> candidateEntities = candidateService.getCandidate(companyName, candidateId);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(candidateEntities), HttpStatus.OK);
    }


    @RequestMapping(value = "candidate/{companyName}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getCandidates.tag}", description = "${api.getCandidates.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getCandidates(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName) throws EmployeeException, IOException {
        Collection<CandidateEntity> candidateEntities =  candidateService.getCandidate(companyName, null);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(candidateEntities), HttpStatus.OK);
    }

    
    @RequestMapping(value = "candidate/{companyName}/{candidateId}", method = RequestMethod.PUT)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.updateCandidate.tag}", description = "${api.updateCandidate.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> updateCandidate(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String candidateId,
            @Valid @RequestBody CandidateUpdateRequest candidateUpdateRequest) throws EmployeeException, IOException {
        return candidateService.updateCandidate(companyName, candidateId, candidateUpdateRequest);
    }

    @RequestMapping(value = "{companyName}/candidate/{candidateId}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.deleteCandidate.tag}", description = "${api.deleteCandidate.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> deleteCandidate(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String candidateId) throws EmployeeException, IOException {

        candidateService.deleteCandidateById(companyName, candidateId);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED),
                HttpStatus.OK
        );
    }

}
