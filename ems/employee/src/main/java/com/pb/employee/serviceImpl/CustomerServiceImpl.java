package com.pb.employee.serviceImpl;

import com.pb.employee.request.CustomerRequest;
import com.pb.employee.request.CustomerUpdateRequest;
import com.pb.employee.service.CustomerService;
import com.pb.employee.util.Constants;
import com.pb.employee.util.EntityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class CustomerServiceImpl implements CustomerService {

    @Autowired
    private EntityUtils entityUtils;

    @Override
    public ResponseEntity<?> createCustomer(String companyId, CustomerRequest customerRequest, String authToken) {
        return entityUtils.sendPostRequest(authToken,customerRequest, Constants.COMPANY_ADD + companyId + Constants.CUSTOMER);
    }

    @Override
    public ResponseEntity<?> getCompanyByIdCustomer(String companyId,String authToken) {
        return  entityUtils.getRequest(authToken,Constants.COMPANY_ADD + companyId + Constants.CUSTOMER+Constants.ALL);
    }

    @Override
    public ResponseEntity<?> getCustomerById(String companyId,String customerId, String authToken) {
        return  entityUtils.getRequest(authToken,Constants.COMPANY_ADD + companyId + Constants.CUSTOMER_GET+ customerId);
    }

    @Override
    public ResponseEntity<?> updateCustomer(String authToken,String companyId,String customerId, CustomerUpdateRequest customerRequest) {
        return entityUtils.sendPatchRequest(authToken,customerRequest, Constants.COMPANY_ADD + companyId + Constants.CUSTOMER_GET + customerId);
    }

    @Override
    public ResponseEntity<?> deleteCustomer(String authToken,String companyId, String customerId) {
        return entityUtils.deleteRequest(authToken, Constants.COMPANY_ADD + companyId + Constants.CUSTOMER_GET + customerId);
    }
}