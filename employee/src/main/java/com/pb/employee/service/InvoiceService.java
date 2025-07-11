package com.pb.employee.service;


import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.InvoiceRequest;
import com.pb.employee.request.InvoiceUpdateRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.time.YearMonth;

public interface InvoiceService {

    ResponseEntity<?> generateInvoice(String authToken,String companyId,String customer,InvoiceRequest request) throws EmployeeException;

    ResponseEntity<?> getInvoiceById(String authToken,String companyId,String customerId,String invoiceId)throws EmployeeException;

    ResponseEntity<?> getCompanyAllInvoices(String authToken,String companyId,String customerId,String year,String month)throws EmployeeException;

    ResponseEntity<?> downloadInvoice(String authToken, String companyId, String customerId,String invoiceId,HttpServletRequest request)throws EmployeeException;
    ResponseEntity<?> updateInvoice(String authToken, String companyId, String customerId, String invoiceId, InvoiceUpdateRequest updateRequest, HttpServletRequest request)  throws EmployeeException;

}