package com.pb.employee.service;


import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.EmployeeRequest;
import com.pb.employee.request.EmployeeUpdateRequest;
import com.pb.employee.request.TemplateRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;

public interface TemplateService {
    ResponseEntity<?> addTemplate(TemplateRequest templateRequest, HttpServletRequest request) throws EmployeeException,IOException;
    ResponseEntity<?> getTemplateNo(String companyName) throws  EmployeeException;
    }