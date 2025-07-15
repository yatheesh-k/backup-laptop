package com.ems.accountant.service;

import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.EmployeeAccountEntity;
import com.ems.accountant.request.EmployeeTDSUpdate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collection;

public interface EmployeeTdsService {
    ResponseEntity<?> employeeTDSComparing(String companyName, String month, String year, MultipartFile file) throws AccountantException, IOException;

    ResponseEntity<?> registerEmployeeForTDS(String companyName, String month, String year, MultipartFile file) throws AccountantException, IOException;

    ResponseEntity<?> updateEmployeeForTDS(String companyName, String employeeId, String accountId, EmployeeTDSUpdate request) throws AccountantException, IOException;

    Collection<EmployeeAccountEntity> getEmployeeAccountDetails(String companyName, String employeeId, String accountId, String month, String year) throws AccountantException, IOException;

    }
