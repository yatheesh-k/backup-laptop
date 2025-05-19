package com.pb.employee.controller;

import com.pb.employee.request.ExperienceLetterFieldsRequest;
import com.pb.employee.request.ExperienceLetterRequest;
import com.pb.employee.service.ExperienceLetterService;
import com.pb.employee.util.Constants;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("")
public class ExperienceLetterController {


    @Autowired
    private ExperienceLetterService serviceLetterService;

    @RequestMapping(value = "/experienceletter/upload", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getPayslip.tag}", description = "${api.getPayslip.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<byte[]> downloadPayslip(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                  @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                  HttpServletRequest request,
                                                  @RequestBody @Valid ExperienceLetterFieldsRequest experienceLetterFieldsRequest) {
        return serviceLetterService.downloadServiceLetter(request, experienceLetterFieldsRequest);
    }

    @RequestMapping(value = "/upload", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getPayslip.tag}", description = "${api.getPayslip.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<byte[]> downloadExperienceLetter(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                  @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                  @RequestBody ExperienceLetterRequest request) {
        return serviceLetterService.uploadExperienceLetter(request);
    }
}
