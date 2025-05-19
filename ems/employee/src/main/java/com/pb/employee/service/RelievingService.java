package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.RelievingRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

public interface RelievingService {

    ResponseEntity<?> addRelievingForEmployee(String employeeId, String companyName, RelievingRequest request) throws EmployeeException;
    ResponseEntity<?> getRelievingByEmployeeId(String companyName, String employeeId) throws EmployeeException;
    ResponseEntity<?> updateEmployeeRelievingById(String relieveId, String companyName, String employeeId, RelievingRequest relievingRequest) throws EmployeeException;
    ResponseEntity<?> deleteRelieveDetails(String companyName, String employeeId, String relieveId) throws EmployeeException;
    ResponseEntity<byte[]> downloadRelievingLetter(HttpServletRequest request, String companyName, String employeeId);
}
