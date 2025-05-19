package com.pb.employee.service;


import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.BackgroundRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;

public interface BackgroundService {

    ResponseEntity<?> backgroundDetailsToEmployee(String companyId, String employeeId, BackgroundRequest backgroundRequest)throws IOException,EmployeeException;

    ResponseEntity<?> getAllBackgroundDetailsByCompanyId(String companyId) throws EmployeeException,IOException;

    ResponseEntity<?> getAllBackgroundDetailsByCompanyEmployeeId(String companyId, String employeeId)throws EmployeeException,IOException;

}