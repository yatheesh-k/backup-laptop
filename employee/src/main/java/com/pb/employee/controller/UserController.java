package com.pb.employee.controller;

import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.CompanyCalendarEntity;
import com.pb.employee.persistance.model.UserEntity;
import com.pb.employee.request.UpdateRolesRequest;
import com.pb.employee.request.UserRequest;
import com.pb.employee.request.UserUpdateRequest;
import com.pb.employee.response.UserResponse;
import com.pb.employee.service.UserService;
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
import java.util.Collection;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/")
public class UserController {

    @Autowired
    private UserService userService;
    @RequestMapping(value = "{companyName}/user", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.registerUser.tag}", description = "${api.registerUser.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description= "CREATED")
    public ResponseEntity<?> registerUser(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                              @RequestHeader(Constants.AUTH_KEY) String authToken,
                                              @Parameter(required = true, description = "${api.registerUserPayload.description}")
                                              @PathVariable String companyName,@RequestBody @Valid UserRequest userRequest,HttpServletRequest request) throws EmployeeException, IOException {
        return userService.registerUser(companyName,userRequest,request);
    }

    @RequestMapping(value = "{companyName}/user/{Id}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getUser.tag}", description = "${api.getUser.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getUserById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                             @RequestHeader(Constants.AUTH_KEY) String authToken,
                                             @PathVariable String companyName, @PathVariable String Id) throws IOException, EmployeeException {

        Collection<UserResponse> users =  userService.getUserById(companyName, Id);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(users), HttpStatus.OK);
    }

    @RequestMapping(value = "{companyName}/users", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getUsers.tag}", description = "${api.getUsers.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getCompanyUsers(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                         @RequestHeader(Constants.AUTH_KEY) String authToken,
                                         @PathVariable String companyName) throws IOException, EmployeeException {
        Collection<UserResponse> users =  userService.getUserById(companyName, null);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(users), HttpStatus.OK);
    }

    @RequestMapping(value = "{companyName}/user/{Id}", method = RequestMethod.PATCH,consumes = MediaType.APPLICATION_JSON_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.updateUser.tag}", description = "${api.updateUser.description}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "202", description= "Accepted")
    public ResponseEntity<?> updateUser(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                               @RequestHeader(Constants.AUTH_KEY) String authToken,
                                               @PathVariable String companyName,
                                               @PathVariable String Id,
                                               @RequestBody @Valid UserUpdateRequest userUpdateRequest) throws IOException, EmployeeException {
        return userService.updateUser(companyName,Id, userUpdateRequest);
    }

    @RequestMapping(value = "{companyName}/user/{Id}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.deleteUser.tag}", description = "${api.deleteUser.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> deleteUser(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                @PathVariable String companyName,@PathVariable String Id) throws EmployeeException {
        userService.deleteUser(companyName,Id);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED), HttpStatus.OK);
    }

}
