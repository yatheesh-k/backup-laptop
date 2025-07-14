package com.ems.accountant.controller;

import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.request.EmployeePTUpdate;
import com.ems.accountant.service.EmployeePTService;
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
public class EmployeePTController {

    @Autowired
    private EmployeePTService employeePTService;

    @RequestMapping(value = "{companyName}/employee/pt", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.employeePTComparing.tag}", description = "${api.employeePTComparing.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> employeePTComparing(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer token")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @RequestParam String month,
            @RequestParam String year,
            @RequestParam("file") MultipartFile file) throws IOException, AccountantException {
        return employeePTService.employeePTComparing(companyName, month, year, file);
    }

    @RequestMapping(value = "{companyName}/employees/pt", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.registerEmployeeForPT.tag}", description = "${api.registerEmployeeForPT.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> registerEmployeeForPT(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer token")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @RequestParam String month,
            @RequestParam String year,
            @RequestParam("file") MultipartFile file) throws IOException, AccountantException {
        return employeePTService.registerEmployeeForPT(companyName, month, year, file);
    }

    @RequestMapping(value = "{companyName}/employee/{employeeId}/pt/{id}", method = RequestMethod.PATCH)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.updateEmployeeForPT.tag}", description = "${api.updateEmployeeForPT.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> updateEmployeeForPT(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer token")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String employeeId,
            @PathVariable String id,
            @RequestBody EmployeePTUpdate request) throws IOException, AccountantException {
        return employeePTService.updateEmployeeForPT(companyName, employeeId, id, request);
    }
}
