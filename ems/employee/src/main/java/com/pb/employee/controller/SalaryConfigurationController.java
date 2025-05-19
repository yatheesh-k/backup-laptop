package com.pb.employee.controller;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.SalaryConfigurationRequest;
import com.pb.employee.service.SalaryConfigurationService;
import com.pb.employee.util.Constants;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("")
public class SalaryConfigurationController {

    @Autowired
    public SalaryConfigurationService salaryConfigurationService;

    @RequestMapping(value = "/allowances", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getAllowances.tag}", description = "${api.getAllowances.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public List<String> getAllowanceColumnNames(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                           @RequestHeader(Constants.AUTH_KEY) String authToken) {
    return salaryConfigurationService.getAllowanceColumnNames();
    }
    @RequestMapping(value = "/deductions", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getDeduction.tag}", description = "${api.getDeduction.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public List<String> getDeductionColumnName(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                @RequestHeader(Constants.AUTH_KEY) String authToken) {
        return salaryConfigurationService.getDeductionsColumnNames();
    }

    @RequestMapping(value = "/salary/Structure", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.salary.structure.tag}", description = "${api.salary.structure.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> AllowancesColumns(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                   @RequestHeader(Constants.AUTH_KEY) String authToken,
                                               @RequestBody @Valid SalaryConfigurationRequest salaryConfigurationRequest) throws EmployeeException {
        return salaryConfigurationService.SalaryColumns(salaryConfigurationRequest);
    }
    @RequestMapping(value = "/{companyName}/salary", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getCompanySalary.tag}", description = "${api.getCompanySalary.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getSalaryStructureByCompany(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                         @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                         @PathVariable String companyName) throws EmployeeException{
        return salaryConfigurationService.getSalaryStructureByCompany(companyName);
    }

}