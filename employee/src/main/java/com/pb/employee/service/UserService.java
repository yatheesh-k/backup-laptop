package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
//import com.pb.employee.request.UpdateRolesRequest;
import com.pb.employee.request.UserRequest;
import com.pb.employee.request.UserUpdateRequest;
import com.pb.employee.response.UserResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.Collection;

public interface UserService {
    ResponseEntity<?> registerUser(String companyName, UserRequest userRequest, HttpServletRequest request) throws EmployeeException, IOException;

    Collection<UserResponse> getUserById(String companyName, String Id)throws EmployeeException;

    ResponseEntity<?>updateUser(String companyName, String Id, UserUpdateRequest userUpdateRequest)throws EmployeeException;

    void deleteUser(String companyName, String Id)throws EmployeeException;

}