package com.pb.employee.service;


import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.CompanyEntity;
import com.pb.employee.request.*;
import com.pb.employee.response.CompanyResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface CompanyService {
    ResponseEntity<?> registerCompany(CompanyRequest companyRequest,HttpServletRequest request) throws EmployeeException;
    ResponseEntity<?> getCompanies( HttpServletRequest request) throws EmployeeException;
    ResponseEntity<?> getCompanyById(String companyId,  HttpServletRequest request) throws EmployeeException;
    ResponseEntity<?> updateCompanyById(String companyId, CompanyUpdateRequest companyUpdateRequest) throws IOException, EmployeeException;
    ResponseEntity<?> updateCompanyImageById(String companyId,  CompanyImageUpdate companyImageUpdate,MultipartFile multipartFile) throws EmployeeException, IOException;

    ResponseEntity<?> updateCompanyStampImageById(String companyId, CompanyStampUpdate companyStampUpdate, MultipartFile multipartFile) throws EmployeeException, IOException;

    ResponseEntity<?> deleteCompanyById(String companyId, String authToken) throws EmployeeException;

    ResponseEntity<?> getCompanyImageById(String companyId, HttpServletRequest request)  throws EmployeeException;

    ResponseEntity<?> passwordResetForEmployee(EmployeePasswordReset employeePasswordReset, String id) throws EmployeeException;
}