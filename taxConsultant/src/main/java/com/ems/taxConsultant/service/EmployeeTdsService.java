package com.ems.taxConsultant.service;

import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.request.EmployeeTDSRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface EmployeeTdsService {
    ResponseEntity<?> employeeTDSComparing(String companyName, String month, String year, MultipartFile file) throws AccountantException, IOException;

    ResponseEntity<?> registerEmployeeForTDS(String companyName, String month, String year, MultipartFile file) throws AccountantException, IOException;

    ResponseEntity<?> updateEmployeeForTDS(String companyName, String employeeId, String accountId, EmployeeTDSRequest request) throws AccountantException, IOException;

    ResponseEntity<?> addSingleEmployeeForTDS(String companyName, EmployeeTDSRequest employeeTDSRequest) throws AccountantException;

}
