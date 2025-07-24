package com.ems.taxConsultant.service;

import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.request.EmployeePTRequest;
import com.ems.taxConsultant.request.EmployeePTUpdate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface EmployeePTService {

    ResponseEntity<?> employeePTComparing(String companyName, String month, String year, MultipartFile file) throws TaxConsultantException, IOException;

    ResponseEntity<?> registerEmployeeForPT(String companyName, String month, String year, MultipartFile file) throws TaxConsultantException, IOException;

    ResponseEntity<?> updateEmployeeForPT(String companyName, String employeeId, String accountId, EmployeePTUpdate request) throws TaxConsultantException, IOException;


    ResponseEntity<?> addSingleEmployeeForPT(String companyName, EmployeePTRequest request) throws TaxConsultantException,IOException;
}
