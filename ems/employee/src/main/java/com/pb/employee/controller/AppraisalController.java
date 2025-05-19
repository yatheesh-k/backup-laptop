package com.pb.employee.controller;

import com.pb.employee.request.AppraisalLetterRequest;
import com.pb.employee.service.AppraisalLetterService;
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
public class AppraisalController {

    @Autowired
    private AppraisalLetterService appraisalLetterService;


    @RequestMapping(value = "/appraisal/upload", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getAppraisalLetter.tag}", description = "${api.getAppraisalLetter.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<byte[]> downloadAppraisalLetter(@Parameter(hidden = true, required = true,
            description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                  @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                  @RequestBody @Valid AppraisalLetterRequest appraisalLetterRequest,
                                                  HttpServletRequest request) {
        return appraisalLetterService.downloadAppraisalLetter(appraisalLetterRequest, request);
    }


}
