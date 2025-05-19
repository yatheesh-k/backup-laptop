package com.invoice.service;

import com.invoice.exception.InvoiceException;
import com.invoice.request.CustomerRequest;
import com.invoice.request.CustomerUpdateRequest;
import org.springframework.http.ResponseEntity;
import java.io.IOException;

public interface CustomerService {

    ResponseEntity<?> createCustomer(String companyId,CustomerRequest customerRequest) throws InvoiceException,IOException;

    ResponseEntity<?> getCustomers(String companyId) throws InvoiceException,IOException;

    ResponseEntity<?> getCustomerById(String companyId,String customerId) throws InvoiceException,IOException;

    ResponseEntity<?> deleteCustomer(String companyId,String customerId) throws InvoiceException,IOException;

    ResponseEntity<?> updateCustomer(String companyId,String customerId, CustomerUpdateRequest customerRequest) throws IOException, InvoiceException;
}
