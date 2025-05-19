package com.invoice.serviceImpl;

import com.invoice.common.ResponseBuilder;
import com.invoice.exception.InvoiceErrorMessageHandler;
import com.invoice.exception.InvoiceErrorMessageKey;
import com.invoice.exception.InvoiceException;
import com.invoice.model.CompanyEntity;
import com.invoice.model.CustomerModel;
import com.invoice.opensearch.OpenSearchOperations;
import com.invoice.repository.CustomerRepository;
import com.invoice.request.CustomerRequest;
import com.invoice.request.CustomerUpdateRequest;
import com.invoice.service.CustomerService;
import com.invoice.util.Constants;
import com.invoice.util.CustomerUtils;

import com.invoice.util.ResourceIdUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;


@Service
@Slf4j
public class CustomerServiceImpl implements CustomerService {

    @Autowired
    private CustomerRepository repository;

    @Autowired
    private OpenSearchOperations openSearchOperations;
    
    @Override
    public ResponseEntity<?> createCustomer(String companyId, CustomerRequest customerRequest) throws InvoiceException, IOException {
        log.debug("Creating customer: {}", customerRequest);
        CompanyEntity companyEntity;
        companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
        if (companyEntity == null) {
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.COMPANY_NOT_FOUND),
                    HttpStatus.NOT_FOUND);
        }
        try {
            // Step 4.1: Generate a unique resource ID for the customer using companyId and customer details
            String customerId = ResourceIdUtils.generateCustomerResourceId(customerRequest.getEmail(),companyId);

            // Step 2: Fetch all customers for the given companyId
            List<CustomerModel> customers = repository.findByCompanyId(companyId); // Assuming you have a method to fetch all customers for a company

            // Encode the mobile number from the request into Base64 format
            String encodedMobileNumber = Base64.getEncoder().encodeToString(customerRequest.getMobileNumber().getBytes());

            // Step 3: Search for the customer with the provided customerId
            Optional<CustomerModel> existingCustomer = customers.stream()
                    .filter(customer -> customer.getCustomerId().equals(customerId) ||
                            customer.getMobileNumber().equals(encodedMobileNumber))
                    .findFirst();

            if (existingCustomer.isPresent()) {
                log.error("Customer already exists with ID: {}", customerId);
                // Return a response indicating that the customer already exists
                return  new ResponseEntity<>(ResponseBuilder.builder().build().
                        createFailureResponse(new Exception(String.valueOf(InvoiceErrorMessageHandler.getMessage
                                (InvoiceErrorMessageKey.CUSTOMER_ALREADY_EXISTS)))),
                        HttpStatus.CONFLICT);
            }
            // If customer does not exist, proceed to create a new customer
            CustomerModel customer = CustomerUtils.maskCustomerProperties(customerRequest, companyId, customerId);
            log.debug("Customer to save: {}", customer);
            repository.save(customer);

            log.info("Customer created successfully with ID: {}", customer.getCustomerId());
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse((String) Constants.CREATE_SUCCESS), HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Unexpected error occurred while creating customer: {}", e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.ERROR_CREATING_CUSTOMER, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> getCustomers(String companyId) throws InvoiceException,IOException {
        log.info("Fetching customers for company ID: {}", companyId);
        CompanyEntity companyEntity;
        companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
        if (companyEntity == null) {
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.COMPANY_NOT_FOUND),
                    HttpStatus.NOT_FOUND);
        }

        try {
            List<CustomerModel> customers = null;
            customers = repository.findByCompanyId(companyId);

            // Check if customers exist
            if (customers != null && !customers.isEmpty()) {
                // Unmask customer properties for each customer
                for (CustomerModel customerModel : customers) {
                    CustomerUtils.unmaskCustomerProperties(customerModel);
                }
                // Return the list of unmasked customers
                return ResponseEntity.ok(customers);
            } else {
              // If no customers are found, return a 404 error
              log.error("No customers found for company ID: {}", companyId);
              throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.CUSTOMER_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            // Log the error and throw an internal server error if something goes wrong
            log.error("Error fetching customers for company ID {}: {}", companyId, e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.UNABLE_TO_GET_CUSTOMER, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> getCustomerById(String companyId,String customerId) throws InvoiceException,IOException {
        log.info("Fetching customer with ID: {}", customerId);
        CompanyEntity companyEntity;
        companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
        if (companyEntity == null) {
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.COMPANY_NOT_FOUND),
                    HttpStatus.NOT_FOUND);
        }
        try {
            // Step 2: Fetch all customers for the given companyId
            List<CustomerModel> customers = repository.findByCompanyId(companyId); // Assuming you have a method to fetch all customers for a company

            // Step 3: Search for the customer with the provided customerId
            Optional<CustomerModel> customerOptional = customers.stream()
                    .filter(customer -> customer.getCustomerId().equals(customerId)) // Filter the customer by ID
                    .findFirst();

            // Step 4: Check if the customer is present in the list
            if (customerOptional.isPresent()) {
                CustomerModel customer = customerOptional.get();
                log.info("Customer fetched successfully: {}", customer);

                // Step 5: Unmask the customer properties (e.g., sensitive fields)
                CustomerUtils.unmaskCustomerProperties(customer);

                // Step 6: Return the response with the customer data
                return ResponseEntity.ok(customer);  // Respond with the customer data

            } else {
                // Customer not found for the given customerId
                log.error("Customer not found with ID: {}", customerId);
                throw new InvoiceException(InvoiceErrorMessageKey.CUSTOMER_NOT_FOUND, HttpStatus.NOT_FOUND);
            }

        }  catch (Exception e) {
            // Log the error and throw an internal server error in case of an exception
            log.error("Error occurred while fetching customer with ID {}: {}", customerId, e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.UNABLE_TO_GET_CUSTOMER, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> updateCustomer(String companyId,String customerId, CustomerUpdateRequest customerRequest) throws InvoiceException,IOException {
        log.info("Updating customer with ID: {}", customerId);

        CompanyEntity companyEntity;
        companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
        if (companyEntity == null) {
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.COMPANY_NOT_FOUND),
                    HttpStatus.NOT_FOUND);
        }
        CustomerModel customerModel;
        try {
            // Step 2: Fetch all customers for the given companyId
            List<CustomerModel> customers = repository.findByCompanyId(companyId); // Assuming you have a method to fetch all customers for a company
            // Step 3: Search for the customer with the provided customerId
            Optional<CustomerModel> customerOptional = customers.stream()
                    .filter(customer -> customer.getCustomerId().equals(customerId)) // Filter the customer by ID
                    .findFirst();

            if (customerOptional.isPresent()) {
                CustomerModel customer = customerOptional.get();

                // Step 4: Check if any field has changed before updating
                int noOfChanges = CustomerUtils.noChangeInValuesOfBank(customer,customerRequest);
                if (noOfChanges==0){
                    log.error("No changes detected for customer with ID: {}", customerId);
                    return new ResponseEntity<>(
                            ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.NO_CHANGES_DETECTED)))),
                            HttpStatus.CONFLICT);
                }

                CustomerUtils.updateCustomerFromRequest(customer, customerRequest);
                CustomerUtils.maskCustomerUpdateProperties(customerRequest,customer);
                repository.save(customer);
            }
            else {
                // Customer not found for the given customerId
                log.error("Customer not found with ID: {}", customerId);
                throw new InvoiceException(InvoiceErrorMessageKey.CUSTOMER_NOT_FOUND, HttpStatus.NOT_FOUND);
            }
            log.info("Customer updated successfully with ID: {}", customerId);
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.UPDATE_SUCCESS), HttpStatus.OK);

        } catch (Exception e) {
            log.error("Unexpected error while updating customer: {}", e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.UNABLE_TO_UPDATE_CUSTOMER.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> deleteCustomer(String companyId,String customerId) throws InvoiceException {
        log.info("Deleting customer with ID: {}", customerId);
        try {
            if (!repository.existsById(customerId)) {
                log.error("Customer not found with ID: {}", customerId);
                throw new InvoiceException(InvoiceErrorMessageKey.CUSTOMER_NOT_FOUND, HttpStatus.NOT_FOUND);
            }
            repository.deleteById(customerId);
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETE_SUCCESS), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error deleting customer with ID {}: {}", customerId, e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.UNABLE_TO_DELETE_CUSTOMER, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}