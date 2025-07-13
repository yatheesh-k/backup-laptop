package com.ems.accountant.controller;

import com.ems.accountant.common.ResponseBuilder;
import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.EmployeeAccountEntity;
import com.ems.accountant.request.EmployeePFRequest;
import com.ems.accountant.request.EmployeePFUpdate;
import com.ems.accountant.service.EmployeePFService;
import com.ems.accountant.utils.Constants;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
            summary = "${api.employeePFComparing.tag}", description = "${api.employeePFComparing.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> employeePFComparing(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @RequestParam(required = true) String month, @RequestParam(required = true) String year, @RequestParam("file")MultipartFile file) throws  IOException, AccountantException {
        return employeePFService.employeePFComparing(companyName, month, year, file);
    }


    @RequestMapping(value = "{companyName}/employees/account", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.registerEmployeeForPF.tag}", description = "${api.registerEmployeeForPF.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> registerEmployeeForPF(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @RequestParam(required = true) String month, @RequestParam(required = true) String year, @RequestParam("file")MultipartFile file) throws  IOException, AccountantException {
        return employeePFService.registerEmployeeForPF(companyName, month, year, file);
    }


    @RequestMapping(value = "{companyName}/employee/account", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.addSingleEmployeeForPF.tag}", description = "${api.addSingleEmployeeForPF.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> addSingleEmployeeForPF(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName, @RequestBody EmployeePFRequest request) throws  IOException, AccountantException {
        return employeePFService.addSingleEmployeeForPF(companyName, request);
    }

    @RequestMapping(value = "{companyName}/employee/{employeeId}/account", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getEmployeePF.tag}", description = "${api.getEmployeePF.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getEmployeeAccountDetails(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName, @PathVariable String employeeId){
        Collection<EmployeeAccountEntity> employeeAccountEntities = employeePFService.getEmployeeAccountDetails(companyName, employeeId, null, null, null);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(employeeAccountEntities), HttpStatus.OK);
    }

    @RequestMapping(value = "{companyName}/employee/account", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getPFForMonthAndYear.tag}", description = "${api.getPFForMonthAndYear.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getPFForMonthAndYear(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName, @RequestParam String month, @RequestParam(required = false) String year) {
        Collection<EmployeeAccountEntity> getPFForMonthAndYear = employeePFService.getEmployeeAccountDetails(companyName, null, null, month, year);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(getPFForMonthAndYear), HttpStatus.OK);
    }

    @RequestMapping(value = "{companyName}/employee/{employeeId}/account/{accountId}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getEmployeeAccountsById.tag}", description = "${api.getEmployeeAccountsById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getEmployeeAccountsById(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName, @PathVariable String employeeId, @PathVariable String accountId) throws  IOException, AccountantException {
        Collection<EmployeeAccountEntity> employeeAccountEntities = employeePFService.getEmployeeAccountDetails(companyName, employeeId, accountId, null, null);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(employeeAccountEntities), HttpStatus.OK);
    }


    @RequestMapping(value = "{companyName}/employee/{employeeId}/account/{accountId}", method = RequestMethod.PATCH)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.updateEmployeeForPf.tag}", description = "${api.updateEmployeeForPf.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> updateEmployeeForAccounts(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName, @PathVariable String employeeId, @PathVariable String accountId, @RequestBody EmployeePFUpdate request
    ) throws  IOException, AccountantException {

        return employeePFService.updateEmployeeForPf(companyName, employeeId, accountId, request);
    }

    @RequestMapping(value = "{companyName}/employee/{employeeId}/account/{accountId}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.deleteEmployeeAccountDetails.tag}", description = "${api.deleteEmployeeAccountDetails.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> deleteEmployeeAccountDetails(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName, @PathVariable String employeeId, @PathVariable String accountId, @RequestBody EmployeePFUpdate request
    ) {

        employeePFService.deleteEmployeeAccountDetails(companyName, employeeId, accountId);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED), HttpStatus.OK);
    }
}
