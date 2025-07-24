package com.ems.taxConsultant.controller;


import com.ems.taxConsultant.common.ResponseBuilder;
import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.exception.ErrorMessageHandler;
import com.ems.taxConsultant.exception.ErrorMessageKey;
import com.ems.taxConsultant.persistance.GSTAccountEntity;
import com.ems.taxConsultant.request.GSTAccountRequest;
import com.ems.taxConsultant.service.GSTAccountService;
import com.ems.taxConsultant.utils.Constants;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collection;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/")
@Slf4j
public class GSTAccountController {

    @Autowired
    private GSTAccountService gstAccountService;

    @RequestMapping(value = "{companyName}/gst/comparing", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.gstComparing.tag}", description = "${api.gstComparing.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> gstComparing(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @RequestParam(required = true) String month, @RequestParam(required = true) String year, @RequestParam("file") MultipartFile file) throws IOException, TaxConsultantException {
        return gstAccountService.gstComparing(companyName, month, year, file);
    }

    @RequestMapping(value = "{companyName}/gst/upload", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.registerGSTAccount.tag}", description = "${api.registerGSTAccount.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> registerGSTAccount(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @RequestParam(required = true) String month, @RequestParam(required = true) String year, @RequestParam("file") MultipartFile file) throws IOException, TaxConsultantException {
        return gstAccountService.registerGSTAccount(companyName, month, year, file);
    }

    @RequestMapping(value = "{companyName}/gst", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.addSingleGSTAccount.tag}", description = "${api.addSingleGSTAccount.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> addSingleGSTAccount(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @RequestBody GSTAccountRequest gstAccountRequest) throws TaxConsultantException {
        return gstAccountService.addSingleGSTAccount(companyName,gstAccountRequest);

    }

    @RequestMapping(value = "{companyName}/gst/{id}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getGSTAccountById.tag}", description = "${api.getGSTAccountById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getGSTAccountById(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String id) throws TaxConsultantException {
        Collection<GSTAccountEntity> account = gstAccountService.getGSTAccount(companyName, null, null, id);
        if (account.isEmpty()) {
            log.error("No GST accounts found for company: {}", companyName);
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.GST_ACCOUNT_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(account), HttpStatus.OK);
    }

    @RequestMapping(value = "{companyName}/gst", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getGSTAccountsByYearAndMonth.tag}", description = "${api.getGSTAccountsByYearAndMonth.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getGSTAccountsByYearAndMonth(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @RequestParam String month,
            @RequestParam String year) throws TaxConsultantException {
        Collection<GSTAccountEntity> account = gstAccountService.getGSTAccount(companyName, month, year, null);
        if (account.isEmpty()) {
            log.error("No GST accounts found for company: {}, month: {}, year: {}", companyName, month, year);
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.GST_ACCOUNT_NOT_FOUND), HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(account), HttpStatus.OK);    }

    @RequestMapping(value = "{companyName}/gst/accounts", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getGSTAccounts.tag}", description = "${api.getGSTAccounts.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getGSTAccountsByCustomer(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName) throws TaxConsultantException {
        Collection<GSTAccountEntity> account = gstAccountService.getGSTAccount(companyName,  null, null, null);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(account), HttpStatus.OK);    }

    @RequestMapping(value = "{companyName}/account/{id}", method = RequestMethod.PATCH, consumes = MediaType.APPLICATION_JSON_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.updateGSTAccount.tag}", description = "${api.updateGSTAccount.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> updateGSTAccount(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String id,
            @RequestBody GSTAccountRequest gstAccountRequest) throws TaxConsultantException {
        return gstAccountService.updateGSTAccount(companyName, id, gstAccountRequest);
    }

    @RequestMapping(value = "{companyName}/gst/{id}", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.deleteGSTAccount.tag}", description = "${api.deleteGSTAccount.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> deleteGSTAccount(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String id) throws TaxConsultantException {
        return gstAccountService.deleteGSTAccount(companyName, id);
    }

    @RequestMapping(value = "{companyName}/account/comparing", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.gstAccountComparing.tag}", description = "${api.gstAccountComparing.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getGstAccountComparing(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @RequestParam(required = true) String month, @RequestParam(required = true) String year) throws TaxConsultantException {
        return gstAccountService.getGstAccountComparing(companyName, month, year);
    }

    @RequestMapping(value = "{companyName}/gst/register", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.gstAccountRegister.tag}", description = "${api.gstAccountRegister.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> GstAccountRegister(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @RequestParam(required = true) String month, @RequestParam(required = true) String year) throws TaxConsultantException {
        return gstAccountService.GstAccountRegister(companyName, month, year);
    }
}
