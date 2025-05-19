package com.pb.employee.controller;


import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.BackgroundRequest;
import com.pb.employee.request.BankRequest;
import com.pb.employee.service.BackgroundService;
import com.pb.employee.util.Constants;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;


@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/")
public class BackgroundController {
    @Autowired
    private BackgroundService backgroundService;

    @RequestMapping(value = "company/{companyId}/employee/{employeeId}/verify", method = RequestMethod.POST,consumes = MediaType.APPLICATION_JSON_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.registerBackground.tag}", description = "${api.registerBackground.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description= "CREATED")
    public ResponseEntity<?> backgroundDetailsToEmployee(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                @Parameter(required = true, description = "${api.registerBackgroundPayload.description}")
                                                @PathVariable String companyId,
                                                @PathVariable String employeeId,
                                                @RequestBody @Valid BackgroundRequest backgroundRequest) throws IOException,EmployeeException {
        return backgroundService.backgroundDetailsToEmployee(companyId,employeeId,backgroundRequest);
    }

    @RequestMapping(value = "company/{companyId}/verify", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getBackground.tag}", description = "${api.getBackground.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getAllBackgroundDetailsByCompanyId(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                            @RequestHeader(Constants.AUTH_KEY) String authToken,
                                            @PathVariable String companyId) throws EmployeeException, IOException {
        return backgroundService.getAllBackgroundDetailsByCompanyId(companyId);
    }

    @RequestMapping(value = "company/{companyId}/employee/{employeeId}/verify", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getBackground.tag}", description = "${api.getBackground.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getAllBackgroundDetailsByCompanyEmployeeId(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                               @RequestHeader(Constants.AUTH_KEY) String authToken,
                                               @PathVariable String companyId,
                                               @PathVariable String employeeId) throws EmployeeException,IOException {
        return backgroundService.getAllBackgroundDetailsByCompanyEmployeeId(companyId, employeeId);
    }

    
}