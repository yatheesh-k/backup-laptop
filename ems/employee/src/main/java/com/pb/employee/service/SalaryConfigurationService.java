package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.SalaryConfigurationRequest;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface SalaryConfigurationService {



    public List<String> getAllowanceColumnNames();
    public List<String> getDeductionsColumnNames();
    public ResponseEntity<?> SalaryColumns(SalaryConfigurationRequest salaryConfigurationRequest) throws EmployeeException;
    public ResponseEntity<?> getSalaryStructureByCompany(String companyName) throws EmployeeException;

}
