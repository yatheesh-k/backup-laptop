package com.ems.accountant.service;

import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.request.EmployeePTUpdate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface EmployeePTService {

    ResponseEntity<?> employeePTComparing(String companyName, String month, String year, MultipartFile file) throws AccountantException, IOException;

    ResponseEntity<?> registerEmployeeForPT(String companyName, String month, String year, MultipartFile file) throws AccountantException, IOException;

    ResponseEntity<?> updateEmployeeForPT(String companyName, String employeeId, String accountId, EmployeePTUpdate request) throws AccountantException, IOException;


}
