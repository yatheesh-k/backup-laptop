package com.pb.employee.controller;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.PayslipRequest;
import com.pb.employee.request.PayslipUpdateRequest;
import com.pb.employee.request.SalaryRequest;
import com.pb.employee.service.PayslipService;
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
@RequestMapping("")
public class PayslipController {

    @Autowired
    private PayslipService payslipService;


    @RequestMapping(value = "/{employeeId}/salary/{salaryId}", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.payslip.employee.tag}", description = "${api.payslip.employee.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "CREATED")
    public ResponseEntity<?> generatePayslip(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                        @RequestHeader(Constants.AUTH_KEY) String authToken,
                                        @Parameter(required = true, description = "${api.salaryPayload.description}")
                                        @RequestBody @Valid PayslipRequest payslipRequest,
                                        @PathVariable String employeeId,
                                        @PathVariable String salaryId) throws EmployeeException, IOException {
        return payslipService.generatePaySlip(payslipRequest, salaryId, employeeId);
    }

    @RequestMapping(value = "/salary", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.payslip.employee.tag}", description = "${api.payslip.employee.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "CREATED")
    public ResponseEntity<?> generateEmployeePayslip(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                             @RequestHeader(Constants.AUTH_KEY) String authToken,
                                             @Parameter(required = true, description = "${api.salaryPayload.description}")
                                             @RequestBody @Valid PayslipRequest payslipRequest) throws EmployeeException, IOException {
        return payslipService.generatePaySlipForAllEmployees(payslipRequest);
    }


    @RequestMapping(value = "/{companyName}/employee/{employeeId}/payslip/{payslipId}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getPayslip.tag}", description = "${api.getPayslip.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getPayslipById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                            @RequestHeader(Constants.AUTH_KEY) String authToken,
                                            @PathVariable String companyName,
                                            @PathVariable String employeeId,
                                            @PathVariable String payslipId) throws EmployeeException, IOException {

        return payslipService.getPayslipById(companyName, employeeId, payslipId);
    }

    @RequestMapping(value = "/{companyName}/employee/{employeeId}/payslips", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getPayslip.tag}", description = "${api.getPayslip.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getEmployeePayslip(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                @PathVariable String companyName,
                                                @PathVariable String employeeId,
                                                @RequestParam(required = false, name = Constants.MONTH) String month,
                                                @RequestParam(Constants.YEAR) String year) throws EmployeeException {
        return payslipService.getEmployeePayslips(companyName, employeeId,month,year);
    }

    @RequestMapping(value = "/{companyName}/employee/all/payslip", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getPayslip.tag}", description = "${api.getPayslip.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getAllEmployeesPayslips(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                @PathVariable String companyName,
                                                @RequestParam(required = false, name = Constants.MONTH) String month,
                                                @RequestParam(Constants.YEAR) String year) throws EmployeeException {
        return payslipService.getAllEmployeesPayslips(companyName,month,year);
    }
    @RequestMapping(value = "/{companyName}/employee/{employeeId}/payslip/{payslipId}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.deletePayslip.tag}", description = "${api.deletePayslip.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> deleteEmployeePayslipById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                       @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                       @PathVariable String companyName,
                                                       @PathVariable String employeeId,
                                                       @PathVariable String payslipId) throws EmployeeException {
        return payslipService.deleteEmployeePayslipById(companyName, employeeId, payslipId);
    }
    @RequestMapping(value = "/{companyName}/employee/{employeeId}/download/{payslipId}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getPayslip.tag}", description = "${api.getPayslip.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<byte[]> downloadPayslip(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                  @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                  @PathVariable String companyName,
                                                  @PathVariable String payslipId,
                                                  @PathVariable String employeeId,
                                                  HttpServletRequest request) {
        return payslipService.downloadPayslip(companyName, payslipId, employeeId, request);
    }

    @RequestMapping(value = "/payslip", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.payslip.employee.response.tag}", description = "${api.payslip.employee.response.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "CREATED")
    public ResponseEntity<?> generateEmployeeAllPayslip(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                     @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                     @RequestParam(required = false, name = Constants.SALARY_ID) String salaryId,
                                                     @RequestBody @Valid PayslipRequest payslipRequest) throws EmployeeException, IOException {
        return payslipService.generatePaySlipForEmployees(salaryId,payslipRequest);
    }

    @RequestMapping(value = "/employee/{employeeId}/payslip/{payslipId}", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.save.payslip.employee.tag}", description = "${api.save.payslip.employee.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "CREATED")
    public ResponseEntity<?> savePayslip(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                         @RequestHeader(Constants.AUTH_KEY) String authToken,
                                         @RequestBody @Valid PayslipUpdateRequest payslipsRequest,
                                         @PathVariable String payslipId,
                                         @PathVariable String employeeId) throws EmployeeException, IOException{
        return payslipService.savePayslip(payslipsRequest, payslipId, employeeId);
    }
}
