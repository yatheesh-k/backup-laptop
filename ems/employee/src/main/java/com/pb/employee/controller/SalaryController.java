package com.pb.employee.controller;


import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.EmployeeSalaryRequest;
import com.pb.employee.request.EmployeeUpdateRequest;
import com.pb.employee.request.SalaryRequest;
import com.pb.employee.request.SalaryUpdateRequest;
import com.pb.employee.service.SalaryService;
import com.pb.employee.util.Constants;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;


@RestController
@CrossOrigin(origins = "*")
@RequestMapping("")
public class SalaryController {
    @Autowired
    private SalaryService salaryService;
    @RequestMapping(value = "/{employeeId}/salary", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.salary.employee.tag}", description = "${api.salary.employee.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description= "CREATED")
    public ResponseEntity<?> addSalary(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                       @RequestHeader(Constants.AUTH_KEY) String authToken,
                                       @Parameter(required = true, description = "${api.salaryPayload.description}")
                                       @RequestBody @Valid EmployeeSalaryRequest salaryRequest,
                                       @PathVariable String employeeId) throws EmployeeException {
        return salaryService.addSalary(salaryRequest,employeeId);
    }

    @RequestMapping(value = "/{companyName}/employee/{employeeId}/salaries", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getSalary.tag}", description = "${api.getSalary.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getEmployeeSalary(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                               @RequestHeader(Constants.AUTH_KEY) String authToken,
                                               @PathVariable String companyName,@PathVariable String employeeId) throws  EmployeeException {
        return salaryService.getEmployeeSalary(companyName,employeeId);
    }

    @RequestMapping(value = "/{companyName}/employee/{employeeId}/salary/{salaryId}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getSalary.tag}", description = "${api.getSalary.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getEmployeeSalaryById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                   @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                   @PathVariable String companyName,
                                                   @PathVariable String employeeId,
                                                   @PathVariable String salaryId) throws EmployeeException, IOException {

        return salaryService.getEmployeeSalaryById(companyName, employeeId, salaryId);
    }

    @RequestMapping(value = "/employee/{employeeId}/salary/{salaryId}", method = RequestMethod.PATCH,consumes = MediaType.APPLICATION_JSON_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.updateSalary.tag}", description = "${api.updateSalary.description}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "202", description= "Accepted")
    public ResponseEntity<?> updateEmployeeSalaryById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                      @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                      @PathVariable String employeeId,
                                                      @RequestBody @Valid SalaryUpdateRequest salaryUpdateRequest,
                                                      @PathVariable String salaryId) throws EmployeeException {
        return salaryService.updateEmployeeSalaryById(employeeId, salaryUpdateRequest, salaryId);
    }
    @RequestMapping(value = "/{companyName}/employee/{employeeId}/salary/{salaryId}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.deleteSalary.tag}", description = "${api.deleteSalary.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> deleteEmployeeSalaryById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                      @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                      @PathVariable String companyName,
                                                      @PathVariable String employeeId,
                                                      @PathVariable String salaryId) throws EmployeeException {
        return salaryService.deleteEmployeeSalaryById(companyName,employeeId,salaryId);
    }

    @RequestMapping(value = "/{companyId}/employee/salaries/download", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.downloadEmployeeSalaries.tag}", description = "${api.downloadEmployeeSalaries.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> EmployeeSalariesDownload(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                         @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                      @PathVariable String companyId, @RequestParam String format, HttpServletRequest request) throws Exception {
        return salaryService.downloadEmployeesSalaries(companyId, format, request);
    }

}