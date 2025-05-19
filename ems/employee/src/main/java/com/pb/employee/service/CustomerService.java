package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.CustomerRequest;
import com.pb.employee.request.CustomerUpdateRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;

public interface CustomerService {

    ResponseEntity<?> createCustomer(String companyId,CustomerRequest customerRequest,String authToken);

    ResponseEntity<?> getCompanyByIdCustomer(String companyId,String authToken);

    ResponseEntity<?> getCustomerById(String companyId,String customerId, String authToken);

    ResponseEntity<?> updateCustomer(String authToken,String companyId,String customerId, CustomerUpdateRequest customerRequest);

    ResponseEntity<?> deleteCustomer(String authToken,String companyId, String customerId);
}
