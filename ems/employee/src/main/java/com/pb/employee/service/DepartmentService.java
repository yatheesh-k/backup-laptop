package com.pb.employee.service;


import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.DepartmentRequest;
import com.pb.employee.request.DepartmentUpdateRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;

public interface DepartmentService {
    ResponseEntity<?> registerDepartment(DepartmentRequest departmentRequest) throws EmployeeException;
    ResponseEntity<?> getDepartmentById(String companyName, String departmentId) throws EmployeeException;
    ResponseEntity<?> updateDepartmentById(String companyName, DepartmentUpdateRequest departmentUpdateRequest) throws EmployeeException;
    ResponseEntity<?> deleteDepartment(String companyName, String departmentId) throws EmployeeException;
    ResponseEntity<?> getDepartments(String companyName) throws EmployeeException;
}