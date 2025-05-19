package com.pb.employee.service;


import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.InvoiceRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

public interface InvoiceService {

    ResponseEntity<?> generateInvoice(String authToken,String companyId,String customer,InvoiceRequest request) throws EmployeeException;

    ResponseEntity<?> getInvoiceById(String authToken,String companyId,String customerId,String invoiceId)throws EmployeeException;

    ResponseEntity<?> getCompanyAllInvoices(String authToken,String companyId,String customerId)throws EmployeeException;

    ResponseEntity<?> downloadInvoice(String authToken, String companyId, String customerId,String invoiceId,HttpServletRequest request)throws EmployeeException;

}