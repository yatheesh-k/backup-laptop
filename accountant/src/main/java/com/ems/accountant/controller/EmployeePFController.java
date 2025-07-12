package com.ems.accountant.controller;

import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.service.EmployeePFService;
import com.ems.accountant.utils.Constants;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.ws.rs.Path;
import java.io.IOException;
import java.util.Collection;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/")
public class EmployeePFController {


    @Autowired
    private EmployeePFService employeePFService;

    @RequestMapping(value = "{companyName}/employee", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getCandidateById.tag}", description = "${api.getCandidateById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> employeeAccountsComparing(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @RequestParam(required = true) String month, @RequestParam(required = true) String year, @RequestParam("file")MultipartFile file) throws  IOException, AccountantException {
        return employeePFService.employeeAccountsComparing(companyName, month, year, file);
    }


    @RequestMapping(value = "{companyName}/employee/account", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getCandidateById.tag}", description = "${api.getCandidateById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> registerEmployeeForAccounts(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @RequestParam(required = true) String month, @RequestParam(required = true) String year, @RequestParam("file")MultipartFile file) throws  IOException, AccountantException {
        return employeePFService.registerEmployeeForAccounts(companyName, month, year, file);
    }
}
