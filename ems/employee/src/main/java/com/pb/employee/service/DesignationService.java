package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.DesignationRequest;
import com.pb.employee.request.DesignationUpdateRequest;
import org.springframework.http.ResponseEntity;

public interface DesignationService {


    ResponseEntity<?> registerDesignation(DesignationRequest designationRequest) throws EmployeeException;
    ResponseEntity<?> getDesignationById(String companyName, String designationId) throws EmployeeException;
    ResponseEntity<?> updateDesignationById(String designationId, DesignationUpdateRequest designationUpdateRequest) throws EmployeeException;
    ResponseEntity<?> deleteDesignation(String companyName, String designationId) throws EmployeeException;
    ResponseEntity<?> getDesignation(String companyName) throws EmployeeException;

}
