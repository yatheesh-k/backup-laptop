package com.pb.employee.controller;


import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.AttendanceRequest;
import com.pb.employee.request.AttendanceUpdateRequest;
import com.pb.employee.service.AttendanceService;
import com.pb.employee.util.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;


@RestController
@CrossOrigin(origins = "*")
@RequestMapping("")
public class AttendanceController {
    @Autowired
    private AttendanceService attendanceService;

    @RequestMapping(value = "/{companyName}/employee/attendance", method = RequestMethod.POST,consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.attendance.company.tag}", description = "${api.attendance.company.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @ApiResponse(responseCode = "201", description= "CREATED")
    public ResponseEntity<?> addAttendanceOfEmployees(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @Parameter(required = true, description = "${api.attendance.Payload.description}")
            @PathVariable String companyName,
            @RequestParam(Constants.FILE) MultipartFile file) throws EmployeeException {
        return attendanceService.uploadAttendanceFile(companyName,file);
    }

    @RequestMapping(value = "/{companyName}/attendance", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getAttendance.tag}", description = "${api.getAttendance.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getAllEmployeesAttendance(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                       @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                       @PathVariable String companyName,
                                                       @RequestParam(required = false,name = Constants.EMPLOYEE_ID) String employeeId,
                                                       @RequestParam(required = false, name = Constants.MONTH) String month,
                                                       @RequestParam(Constants.YEAR) String year) throws IOException,EmployeeException {
        return attendanceService.getAllEmployeeAttendance(companyName,employeeId,month,year);
    }

    @RequestMapping(value = "/{companyName}/employee/{employeeId}/attendance/{attendanceId}", method = RequestMethod.PATCH,consumes = MediaType.APPLICATION_JSON_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.updateAttendance.tag}", description = "${api.updateAttendance.description}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "202", description= "Accepted")
    public ResponseEntity<?> updateEmployeeAttendanceById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                      @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                          @PathVariable String companyName,
                                                          @PathVariable String employeeId,
                                                          @PathVariable String attendanceId,
                                                          @RequestBody @Valid AttendanceUpdateRequest updateRequest) throws EmployeeException {
        return attendanceService.updateEmployeeAttendanceById(companyName,employeeId, attendanceId,updateRequest);
    }

    @RequestMapping(value = "/{companyName}/employee/{employeeId}/attendance/{attendanceId}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.deleteAttendance.tag}", description = "${api.deleteAttendance.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> deleteEmployeeAttendanceById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                       @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                       @PathVariable String companyName,
                                                       @PathVariable String employeeId,
                                                       @PathVariable String attendanceId) throws EmployeeException {
        return attendanceService.deleteEmployeeAttendanceById(companyName, employeeId, attendanceId);
    }
}
