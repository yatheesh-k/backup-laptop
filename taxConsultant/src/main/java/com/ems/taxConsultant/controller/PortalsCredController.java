package com.ems.taxConsultant.controller;

import com.ems.taxConsultant.common.ResponseBuilder;
import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.exception.ErrorMessageHandler;
import com.ems.taxConsultant.exception.ErrorMessageKey;
import com.ems.taxConsultant.persistance.PortalsCredEntity;
import com.ems.taxConsultant.request.PortalsCredRequest;
import com.ems.taxConsultant.service.PortalCredService;
import com.ems.taxConsultant.utils.Constants;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Collection;

@Slf4j
@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/")
public class PortalsCredController {


    @Autowired
    private PortalCredService portalCredService;

    @RequestMapping(value = "{companyName}/portalCred", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.addPortalDetails.tag}", description = "${api.addPortalDetails.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description= "CREATED")
    public ResponseEntity<?> addPortalDetails(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                           @RequestHeader(Constants.AUTH_KEY) String authToken,
                                           @PathVariable String companyName,
                                           @Parameter(required = true, description = "${api.addPTResponsePayload.description}")
                                           @RequestBody @Valid PortalsCredRequest request) throws AccountantException {
        return portalCredService.addPortalDetails(companyName, request);
    }

    @RequestMapping(value = "{companyName}/portalCred/{id}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getPortalCredById.tag}", description = "${api.getPortalCredById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getPortalCred(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String id) throws AccountantException {
        Collection<PortalsCredEntity> portalsCredEntities = portalCredService.getPortalCred(companyName, id);
        if (portalsCredEntities.isEmpty()) {
            log.error("portals credentials not found for company: {}, id: {}", companyName, id);
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.PORTALS_CREDENTIALS_NOT_FOUND, id), HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(portalsCredEntities), HttpStatus.OK);
    }

    @RequestMapping(value = "{companyName}/portalCred", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getPortalCred.tag}", description = "${api.getPortalCred.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getPortalCred(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName) {
        Collection<PortalsCredEntity> portalsCredEntities =  portalCredService.getPortalCred(companyName, null);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(portalsCredEntities), HttpStatus.OK);
    }

    @RequestMapping(value = "{companyName}/portalCred/{id}", method = RequestMethod.PATCH)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.updatePortalsCred.tag}", description = "${api.updatePortalsCred.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> updatePortalsCred(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String id,
            @Valid @RequestBody PortalsCredRequest updateRequest) throws AccountantException {
        return portalCredService.updatePortalsCred(companyName, id, updateRequest);
    }

    @RequestMapping(value = "{companyName}/portalCred/{id}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.deletePortalCredById.tag}", description = "${api.deletePortalCredById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> deletePortalCredById(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String id) throws AccountantException, IOException {

        portalCredService.deletePortalCredById(companyName, id);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED),
                HttpStatus.OK
        );
    }
}
