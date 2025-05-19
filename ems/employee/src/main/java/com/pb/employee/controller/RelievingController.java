package com.pb.employee.controller;


import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.DepartmentUpdateRequest;
import com.pb.employee.request.ExperienceLetterFieldsRequest;
import com.pb.employee.request.PayslipRequest;
import com.pb.employee.request.RelievingRequest;
import com.pb.employee.service.RelievingService;
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
public class RelievingController {

    @Autowired
    private RelievingService relievingService;

    @RequestMapping(value = "/company/{companyName}/employee/{employeeId}/relieving", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.relieving.tag}", description = "${api.relieving.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "CREATED")
    public ResponseEntity<?> addRelieving(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                             @RequestHeader(Constants.AUTH_KEY) String authToken,
                                             @Parameter(required = true, description = "${api.salaryPayload.description}")
                                             @PathVariable String employeeId,
                                             @PathVariable String companyName,
                                             @RequestBody @Valid RelievingRequest request) throws EmployeeException, IOException {
        return relievingService.addRelievingForEmployee(employeeId, companyName, request);
    }


    @RequestMapping(value = "/{companyName}/relieving/{employeeId}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getRelieving.tag}", description = "${api.getRelieving.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getEmployeeRelieving(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                               @RequestHeader(Constants.AUTH_KEY) String authToken,
                                               @PathVariable String companyName, @PathVariable String employeeId) throws EmployeeException {
        return relievingService.getRelievingByEmployeeId(companyName, employeeId);
    }

    @RequestMapping(value = "/{companyName}/employee/{employeeId}/relieve/{relieveId}", method = RequestMethod.PATCH,consumes = MediaType.APPLICATION_JSON_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.updateRelieving.tag}", description = "${api.updateRelieving.description}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "202", description= "Accepted")
    public ResponseEntity<?> updateEmployeeRelievingById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                  @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                  @PathVariable String relieveId,
                                                  @PathVariable String employeeId,
                                                  @PathVariable String companyName,
                                                  @RequestBody @Valid RelievingRequest request) throws EmployeeException {
        return relievingService.updateEmployeeRelievingById(relieveId, companyName, employeeId, request);
    }
    @RequestMapping(value = "/{companyName}/employee/{employeeId}/relieve/{relieveId}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.deleteRelieving.tag}", description = "${api.deleteRelieving.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> deleteRelieveDetails(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                              @RequestHeader(Constants.AUTH_KEY) String authToken,
                                              @PathVariable String companyName,
                                              @PathVariable String employeeId,
                                              @PathVariable String relieveId) throws EmployeeException {
        return relievingService.deleteRelieveDetails(companyName, employeeId, relieveId);
    }

    @RequestMapping(value = "/{companyName}/employee/{employeeId}/download", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.downloadRelieving.tag}", description = "${api.downloadRelieving.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<byte[]> downloadRelieveLetter(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                  @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                  HttpServletRequest request,
                                                  @PathVariable String companyName,
                                                  @PathVariable String employeeId) {
        return relievingService.downloadRelievingLetter(request, companyName, employeeId);
    }
}
