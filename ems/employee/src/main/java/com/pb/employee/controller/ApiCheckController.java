package com.pb.employee.controller;

import com.pb.employee.util.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("")
public class ApiCheckController {

    private static final Logger log = LoggerFactory.getLogger(ApiCheckController.class);

    @RequestMapping(value = "/health/readyz", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(summary = "${api.getApiCheck.tag}", description = "${api.getApiCheck.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public String getApi() {
        log.info("Entered the Employee API check controller");
        return Constants.SUCCESS;
    }


}
