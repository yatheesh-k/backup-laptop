package com.ems.accountant.controller;

import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.request.EmployeePFRequest;
import com.ems.accountant.request.EmployeeTDSRequest;
import com.ems.accountant.service.EmployeeTdsService;
import com.ems.accountant.utils.Constants;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/")
public class EmployeeTDSController {

    @Autowired
    private EmployeeTdsService employeeTDSService;

    @RequestMapping(value = "{companyName}/tds/comparing", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.employeeTDSComparing.tag}", description = "${api.employeeTDSComparing.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> employeeTDSComparing(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @RequestParam(required = true) String month, @RequestParam(required = true) String year, @RequestParam("file") MultipartFile file) throws AccountantException, IOException {
        return employeeTDSService.employeeTDSComparing(companyName, month, year, file);
    }

    @RequestMapping(value = "{companyName}/employees/tds", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.registerEmployeeForTDS.tag}", description = "${api.registerEmployeeForTDS.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> registerEmployeeForTDS(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @RequestParam(required = true) String month, @RequestParam(required = true) String year, @RequestParam("file")MultipartFile file) throws  IOException, AccountantException {
        return employeeTDSService.registerEmployeeForTDS(companyName, month, year, file);
    }

    @RequestMapping(value = "{companyName}/employee/{employeeId}/tds/{id}", method = RequestMethod.PATCH)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.updateEmployeeForTDS.tag}", description = "${api.updateEmployeeForTDS.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> updateEmployeeForTDS(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer token")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String employeeId,
            @PathVariable String id,
            @RequestBody EmployeeTDSRequest request) throws IOException, AccountantException {
        return employeeTDSService.updateEmployeeForTDS(companyName, employeeId, id, request);
    }

    @RequestMapping(value = "{companyName}/employee/tds", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.addSingleEmployeeForTDS.tag}", description = "${api.addSingleEmployeeForTDS.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> addSingleEmployeeForTDS(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName, @RequestBody EmployeeTDSRequest request) throws  IOException, AccountantException {
        return employeeTDSService.addSingleEmployeeForTDS(companyName, request);
    }
}
