package com.pb.employee.controller;

import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.EmployeeAccounts.EmployeeAccountsResponse;
import com.pb.employee.request.EmployeeDetailsDownloadRequest;
import com.pb.employee.request.EmployeeIdRequest;
import com.pb.employee.request.EmployeeRequest;
import com.pb.employee.request.EmployeeUpdateRequest;
import com.pb.employee.service.EmployeeService;
import com.pb.employee.util.Constants;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;


@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/")
public class EmployeeController {
    @Autowired
    private EmployeeService employeeService;
    @RequestMapping(value = "employee", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.registerEmployee.tag}", description = "${api.registerEmployee.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description= "CREATED")
    public ResponseEntity<?> registerEmployee(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                              @RequestHeader(Constants.AUTH_KEY) String authToken,
                                              @Parameter(required = true, description = "${api.registerEmployeePayload.description}")
                                              @RequestBody @Valid EmployeeRequest employeeRequest,
                                              HttpServletRequest request) throws EmployeeException {
        return employeeService.registerEmployee(employeeRequest,request);
    }

    @RequestMapping(value = "{companyName}/employee", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getEmployees.tag}", description = "${api.getEmployees.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getEmployee(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                         @RequestHeader(Constants.AUTH_KEY) String authToken,
                                         @PathVariable String companyName, HttpServletRequest request) throws IOException, EmployeeException {
        return employeeService.getEmployees(companyName, request);
    }

    @RequestMapping(value = "/{companyName}/withoutAttendance", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getEmployees.tag}", description = "${api.getEmployees.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getEmployeeWithoutAttendance(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                          @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                          @PathVariable String companyName,
                                                          @RequestParam(Constants.MONTH) String month,
                                                          @RequestParam(Constants.YEAR) String year) throws IOException,EmployeeException {
        return employeeService.getEmployeeWithoutAttendance(companyName,month,year);
    }

    @RequestMapping(value = "{companyName}/employee/{employeeId}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getEmployee.tag}", description = "${api.getEmployee.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getEmployeeById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                             @RequestHeader(Constants.AUTH_KEY) String authToken,
                                             @PathVariable String companyName, @PathVariable String employeeId, HttpServletRequest request) throws IOException, EmployeeException {

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(employeeService.getEmployeeById(companyName, employeeId, request)), HttpStatus.OK);
    }

    @RequestMapping(value = "employee/{employeeId}", method = RequestMethod.PATCH,consumes = MediaType.APPLICATION_JSON_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.updateEmployee.tag}", description = "${api.updateEmployee.description}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "202", description= "Accepted")
    public ResponseEntity<?> updateCompanyById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                               @RequestHeader(Constants.AUTH_KEY) String authToken,
                                               @PathVariable String employeeId,
                                               @RequestBody @Valid  EmployeeUpdateRequest employeeUpdateRequest) throws IOException, EmployeeException {
        return employeeService.updateEmployeeById(employeeId, employeeUpdateRequest);
    }

    @RequestMapping(value = "{companyName}/employee/{employeeId}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.deleteEmployee.tag}", description = "${api.deleteEmployee.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> deleteEmployeeById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                @PathVariable String companyName,@PathVariable String employeeId) throws EmployeeException {
        return employeeService.deleteEmployeeById(companyName,employeeId);
    }

    @RequestMapping(value = "{companyName}/employees/download", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.downloadEmployeesDetails.tag}", description = "${api.downloadEmployeesDetails.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> downloadEmployeesDetails(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                      @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                      @PathVariable String companyName,
                                                      @RequestBody EmployeeDetailsDownloadRequest detailsRequest,
                                                      @RequestParam String format, HttpServletRequest request) throws Exception {
        return employeeService.downloadEmployeeDetails(companyName, format, detailsRequest,request);
    }

    @RequestMapping(value = "{companyName}/employee/error", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getEmployee.tag}", description = "${api.getEmployee.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getEmployeeId(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                           @RequestHeader(Constants.AUTH_KEY) String authToken,
                                           @PathVariable String companyName, @RequestBody @Valid EmployeeIdRequest employeeIdRequest) throws IOException, EmployeeException {

        return employeeService.getEmployeeId(companyName, employeeIdRequest);
    }

    @RequestMapping(value = "candidate/{candidateId}", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.registerEmployeeWithCandidate.tag}", description = "${api.registerEmployeeWithCandidate.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "CREATED")
    public ResponseEntity<?> registerEmployeeWithCandidate(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                           @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                           @PathVariable String candidateId,
                                                           @RequestBody @Valid EmployeeRequest employeeRequest, HttpServletRequest request) throws EmployeeException {

        return employeeService.registerEmployeeWithCandidate(employeeRequest,candidateId, request);
    }

    @RequestMapping(value = "{companyName}/employee/{employeeId}/image", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.uploadEmployeeImage.tag}", description = "${api.uploadEmployeeImage.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Employee Image Uploaded Successfully")
    public ResponseEntity<?> uploadEmployeeImage(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef}")
                                                 @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                 @PathVariable String companyName,
                                                 @PathVariable String employeeId,
                                                 @RequestParam MultipartFile file) throws EmployeeException, IOException {
        return employeeService.uploadEmployeeImage(companyName, employeeId, file);
    }

    @RequestMapping(value = "{companyName}/employee/{employeeId}/image", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getEmployeeImage.tag}", description = "${api.getEmployeeImage.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Employee Image fetched Successfully")
    public ResponseEntity<?> getEmployeeImage(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef}")
                                              @RequestHeader(Constants.AUTH_KEY) String authToken,
                                              @PathVariable String companyName,
                                              @PathVariable String employeeId,
                                              HttpServletRequest request) throws EmployeeException, IOException {
        return employeeService.getEmployeeImage(companyName, employeeId, request);
    }

    @RequestMapping(value = "{companyName}/employee/accounts", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getEmployee.tag}", description = "${api.getEmployee.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Employee Image fetched Successfully")
    public ResponseEntity<?> getEmployeeAccountDetails(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef}")
                                              @RequestHeader(Constants.AUTH_KEY) String authToken,
                                              @PathVariable String companyName) throws EmployeeException, IOException {
        List<EmployeeAccountsResponse> employeeAccountsResponses = employeeService.getEmployeesAccountsDetails(companyName);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(employeeAccountsResponses), HttpStatus.OK);
    }


    @RequestMapping(value = "{companyName}/employees/upload", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.registerEmployees.tag}", description = "${api.registerEmployees.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Employee Image fetched Successfully")
    public ResponseEntity<?> registerEmployeeForAccounts(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef}")
                                                       @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                       @PathVariable String companyName, @RequestParam("file") MultipartFile file) throws EmployeeException, IOException {
        return employeeService.registerEmployeeForAccounts(companyName, file);
    }
}