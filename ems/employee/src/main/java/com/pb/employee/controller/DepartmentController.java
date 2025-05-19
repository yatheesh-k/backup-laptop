package com.pb.employee.controller;


import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.CompanyUpdateRequest;
import com.pb.employee.request.DepartmentRequest;
import com.pb.employee.request.DepartmentUpdateRequest;
import com.pb.employee.service.DepartmentService;
import com.pb.employee.util.Constants;
import io.swagger.v3.oas.annotations.Parameter;
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
public class DepartmentController {
    @Autowired
    private DepartmentService departmentService;
    @RequestMapping(value = "/department", method = RequestMethod.POST,consumes = MediaType.APPLICATION_JSON_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.registerDepartment.tag}", description = "${api.registerDepartment.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description= "CREATED")
    public ResponseEntity<?> registerDepartment(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                @Parameter(required = true, description = "${api.registerDepartmentPayload.description}")
                                                @RequestBody @Valid DepartmentRequest departmentRequest) throws EmployeeException {
        return departmentService.registerDepartment(departmentRequest);
    }

    @RequestMapping(value = "/{companyName}/department", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getDepartments.tag}", description = "${api.getDepartments.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getDepartments(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                            @RequestHeader(Constants.AUTH_KEY) String authToken,
                                            @PathVariable String companyName) throws EmployeeException {
        return departmentService.getDepartments(companyName);
    }

    @RequestMapping(value = "/{companyName}/department/{departmentId}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getDepartment.tag}", description = "${api.getDepartment.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getDepartmentById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                               @RequestHeader(Constants.AUTH_KEY) String authToken,
                                               @PathVariable String companyName, @PathVariable String departmentId) throws EmployeeException {
        return departmentService.getDepartmentById(companyName, departmentId);
    }

    @RequestMapping(value = "/{companyName}/department/{departmentId}", method = RequestMethod.PATCH,consumes = MediaType.APPLICATION_JSON_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.updateDepartment.tag}", description = "${api.updateDepartment.description}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "202", description= "Accepted")
    public ResponseEntity<?> updateDepartmentById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                  @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                  @PathVariable String departmentId,
                                                  @RequestBody @Valid DepartmentUpdateRequest departmentUpdateRequest) throws EmployeeException {
        return departmentService.updateDepartmentById(departmentId, departmentUpdateRequest);
    }
    @RequestMapping(value = "/{companyName}/department/{departmentId}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.deleteDepartment.tag}", description = "${api.deleteDepartment.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> deleteDepartment(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                              @RequestHeader(Constants.AUTH_KEY) String authToken,
                                              @PathVariable String companyName,
                                              @PathVariable String departmentId) throws EmployeeException {
        return departmentService.deleteDepartment(companyName, departmentId);
    }
}