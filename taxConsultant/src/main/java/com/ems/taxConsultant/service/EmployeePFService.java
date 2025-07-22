package com.ems.taxConsultant.service;

import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.persistance.EmployeeAccountEntity;
import com.ems.taxConsultant.request.EmployeePFRequest;
import com.ems.taxConsultant.request.EmployeePFUpdate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collection;

public interface EmployeePFService {
    ResponseEntity<?> employeePFComparing(String companyName, String month, String year, MultipartFile file) throws AccountantException, IOException;

    ResponseEntity<?> registerEmployeeForPF(String companyName, String month, String year, MultipartFile file) throws AccountantException, IOException;

    ResponseEntity<?> addSingleEmployeeForPF(String companyName, EmployeePFRequest request) throws AccountantException, IOException;

    Collection<EmployeeAccountEntity> getEmployeeAccountDetails(String companyName, String employeeId, String accountId, String month, String year);

    ResponseEntity<?> updateEmployeeForPf(String companyName, String employeeId, String accountId, EmployeePFUpdate request) throws AccountantException, IOException;

    void deleteEmployeeAccountDetails(String companyName, String employeeId, String accountId);
}
