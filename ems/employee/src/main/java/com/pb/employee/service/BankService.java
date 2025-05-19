package com.pb.employee.service;


import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.BankRequest;
import com.pb.employee.request.BankUpdateRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;

public interface BankService {

    ResponseEntity<?> bankDetailsToCompany(String companyId, BankRequest bankRequest,HttpServletRequest request)throws IOException,EmployeeException;

    ResponseEntity<?> getAllBanksByCompanyId(String companyId) throws EmployeeException,IOException;

    ResponseEntity<?> getBankDetailsById(String companyId, String bankId)throws EmployeeException,IOException;

    ResponseEntity<?> updateBankById(String companyId,String bankId, BankUpdateRequest bankUpdateRequest)throws EmployeeException,IOException;

    ResponseEntity<?> deleteBankById(String companyId, String bankId)throws EmployeeException,IOException;
}