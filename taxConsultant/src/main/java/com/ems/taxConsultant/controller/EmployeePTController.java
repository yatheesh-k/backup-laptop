package com.ems.taxConsultant.controller;

import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.request.EmployeePTRequest;
import com.ems.taxConsultant.request.EmployeePTUpdate;
import com.ems.taxConsultant.service.EmployeePTService;
import com.ems.taxConsultant.utils.Constants;
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

    @RequestMapping(value = "{companyName}/pt/comparing", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.employeePTComparing.tag}", description = "${api.employeePTComparing.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> employeePTComparing(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer token")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @RequestParam String month,
            @RequestParam String year,
            @RequestParam("file") MultipartFile file) throws IOException, TaxConsultantException {
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
            @RequestParam("file") MultipartFile file) throws IOException, TaxConsultantException {
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
            @RequestBody EmployeePTUpdate request) throws IOException, TaxConsultantException {
        return employeePTService.updateEmployeeForPT(companyName, employeeId, id, request);
    }

    @RequestMapping(value = "{companyName}/employee/pt", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.addSingleEmployeeForPT.tag}", description = "${api.addSingleEmployeeForPT.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> addSingleEmployeeForPT(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName, @RequestBody EmployeePTRequest request) throws  IOException, TaxConsultantException {
        return employeePTService.addSingleEmployeeForPT(companyName, request);
    }

    @RequestMapping(value = "{companyName}/pt/comparing", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.employeePTComparing.tag}", description = "${api.employeePTComparing.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> employeePTComparing(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @RequestParam String month, @RequestParam String year) throws IOException, TaxConsultantException {
        return employeePTService.employeesPTComparing(companyName, month, year);
    }

    @RequestMapping(value = "{companyName}/pt", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.registerEmployeeForPT.tag}", description = "${api.registerEmployeeForPT.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> registerEmployeesForPT(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @RequestParam String month, @RequestParam String year) throws TaxConsultantException {
        return employeePTService.registerEmployeesForPT(companyName, month, year);
    }

}
