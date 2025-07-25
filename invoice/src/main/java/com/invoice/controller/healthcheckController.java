package com.invoice.controller;

import com.invoice.util.Constants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;


@Slf4j
@RestController
@CrossOrigin(origins = "*")
public class healthcheckController {
    @RequestMapping(value = "/health/readyz", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(summary = "${api.getApiCheck.tag}", description = "${api.getApiCheck.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public String getapi() {
        log.info("Entered the Employee API check controller");
        return Constants.SUCCESS;
    }
    @RequestMapping(value = "/health/livez", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(summary = "${api.getApiCheck.tag}", description = "${api.getApiCheck.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public String getApi() {
        log.info("Entered the Identity API check controller");
        return Constants.SUCCESS;
    }

}
