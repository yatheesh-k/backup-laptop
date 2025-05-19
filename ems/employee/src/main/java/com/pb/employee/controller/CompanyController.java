package com.pb.employee.controller;


import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.*;
import com.pb.employee.service.CompanyService;
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
@RequestMapping("/company")
public class CompanyController {
    @Autowired
    private CompanyService companyService;
    @RequestMapping(value = "", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.registerCompany.tag}", description = "${api.registerCompany.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description= "CREATED")
    public ResponseEntity<?> registerCompany(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                             @RequestHeader(Constants.AUTH_KEY) String authToken,
                                             @Parameter(required = true, description = "${api.registerCompanyPayload.description}")
                                             @RequestBody @Valid CompanyRequest companyRequest,
                                             HttpServletRequest request) throws EmployeeException {
        return companyService.registerCompany(companyRequest,request);
    }

    @RequestMapping(value = "", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getCompanies.tag}", description = "${api.getCompanies.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getCompanies(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                          @RequestHeader(Constants.AUTH_KEY) String authToken,
                                          HttpServletRequest request) throws EmployeeException {
        return companyService.getCompanies(request);
    }

    @RequestMapping(value = "/{companyId}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getCompany.tag}", description = "${api.getCompany.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getCompanyById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                            @RequestHeader(Constants.AUTH_KEY) String authToken,
                                            @PathVariable String companyId,
                                            HttpServletRequest request) throws EmployeeException {
        return companyService.getCompanyById(companyId, request);
    }

    @RequestMapping(value = "/{companyId}", method = RequestMethod.PATCH,consumes = MediaType.APPLICATION_JSON_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.updateCompany.tag}", description = "${api.updateCompany.description}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "202", description= "Accepted")
    public ResponseEntity<?> updateCompanyById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                               @RequestHeader(Constants.AUTH_KEY) String authToken,
                                               @PathVariable String companyId,
                                               @RequestBody @Valid CompanyUpdateRequest companyUpdateRequest) throws IOException, EmployeeException {
        return companyService.updateCompanyById(companyId,companyUpdateRequest);
    }
    @RequestMapping(value = "/image/{companyId}", method = RequestMethod.PATCH,consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.updateCompany.tag}", description = "${api.updateCompany.description}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "202", description= "Accepted")
    public ResponseEntity<?> updateCompanyImageById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                               @RequestHeader(Constants.AUTH_KEY) String authToken,
                                               @PathVariable String companyId,
                                               @ModelAttribute @Valid CompanyImageUpdate companyImageUpdate,
                                               @RequestPart(Constants.FILE) MultipartFile file ) throws IOException, EmployeeException {
        return companyService.updateCompanyImageById(companyId,companyImageUpdate, file);
    }

    @RequestMapping(value = "/stampImage/{companyId}", method = RequestMethod.PATCH,consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.updateCompanyStamp.tag}", description = "${api.updateCompanyStamp.description}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "202", description= "Accepted")
    public ResponseEntity<?> updateCompanyStampImageById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                    @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                    @PathVariable String companyId,
                                                    @ModelAttribute @Valid CompanyStampUpdate companyStampUpdate,
                                                    @RequestPart(Constants.FILE) MultipartFile file ) throws IOException, EmployeeException {
        return companyService.updateCompanyStampImageById(companyId,companyStampUpdate, file);
    }

    @RequestMapping(value = "/employee/{employeeId}/password", method = RequestMethod.PATCH,consumes = MediaType.APPLICATION_JSON_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.updatePassword.tag}", description = "${api.updatePassword.description}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "202", description= "Accepted")
    public ResponseEntity<?> passwordResetForEmployee(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                    @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                    @RequestBody EmployeePasswordReset employeePasswordReset,
                                            @PathVariable String employeeId) throws  EmployeeException {

        return companyService.passwordResetForEmployee(employeePasswordReset, employeeId);
    }
    @RequestMapping(value = "/{companyId}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.deleteCompany.tag}", description = "${api.deleteCompany.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> deleteCompanyById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                               @RequestHeader(Constants.AUTH_KEY) String authToken,
                                               @PathVariable String companyId) throws EmployeeException {
        return companyService.deleteCompanyById(companyId, authToken);
    }
    @RequestMapping(value = "/{companyId}/image", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getCompanyImage.tag}", description = "${api.getCompanyImage.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getCompanyImage(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                            @RequestHeader(Constants.AUTH_KEY) String authToken,
                                            @PathVariable String companyId, HttpServletRequest request) throws EmployeeException {
        return companyService.getCompanyImageById(companyId, request);
    }

}