package com.pb.employee.serviceImpl;


import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.BackgroundRequest;
import com.pb.employee.service.BackgroundService;
import com.pb.employee.util.BackgroundUtils;
import com.pb.employee.util.Constants;
import com.pb.employee.util.ResourceIdUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
@Slf4j
public class BackgroundServiceImpl implements BackgroundService {


    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Override
    public ResponseEntity<?> backgroundDetailsToEmployee(String companyId, String employeeId, BackgroundRequest backgroundRequest) throws IOException, EmployeeException {
        CompanyEntity companyEntity;
        EmployeeEntity employeeEntity;
        Entity backgroundEntity = null;

        // Step 1: Validate if the company exists in the database
        log.debug("Validating Company Exists or not {}", companyId);
        companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);

        if (companyEntity == null) {
            log.error("CompanyId not exists: {}", companyId);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST),
                    HttpStatus.NOT_FOUND);
        }

        String index = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
        // Step 1: Validate if the company exists in the database
        log.debug("Validating Employee Exists or not {}", employeeId);
        employeeEntity = openSearchOperations.getEmployeeById(employeeId, null, index);
        if (employeeEntity == null) {
            log.error("Employee Id not exists: {}", employeeId);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND),
                    HttpStatus.NOT_FOUND);
        }

        String resourceId = ResourceIdUtils.generateBackgroundResourceId(backgroundRequest.getCompanyName(), employeeId);

        // Step 4.2: Check for inter-list duplicates (against the database)
        BackgroundEntity backgroundById = openSearchOperations.getBackgroundById(index,null,resourceId);  // Fetch bank records from the DB

        if (backgroundById != null) {
            log.error("Background Details already exist: {}", resourceId);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.BACKGROUND_ALREADY_EXISTS),
                    HttpStatus.CONFLICT);
        }
        // Step 4.3: Mask and prepare the bank entity
        backgroundEntity = BackgroundUtils.maskEmployeeBackgroundProperties(backgroundRequest, resourceId, companyId,employeeId);

        try {
          // Step 4.4: Save the bank details to the generated index for each bank entry
           openSearchOperations.saveEntity(backgroundEntity, resourceId, index);
           log.info("Successfully saved bank details for employee Id: {}", employeeId);
        } catch (Exception exception) {
           log.error("Error while saving bank details for employeeId {}: {}", employeeId, exception.getMessage());
           throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_BACKGROUND_DETAILS),
             HttpStatus.INTERNAL_SERVER_ERROR);
        }
        // Step 5: Return success response after saving all bank details
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<?> getAllBackgroundDetailsByCompanyId(String companyId) throws EmployeeException,IOException {
        CompanyEntity companyEntity=null;
        companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS); // Adjust this call as needed

        if (companyEntity == null) {
            log.error("Company with ID {} not found", companyId);
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_COMPANY), companyId),
                    HttpStatus.NOT_FOUND);
        }
        List<BackgroundEntity> backgroundEntities = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
        try {
            backgroundEntities = openSearchOperations.getBackGroundDetailsOfCompany(index);
            for(BackgroundEntity bankEntity : backgroundEntities) {
                BackgroundUtils.unmaskBackgroundProperties(bankEntity);
            }

        } catch (Exception ex) {
            log.error("Exception while fetching Background Details for company {}: {}", companyId, ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_BACKGROUND_DETAILS),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (backgroundEntities == null || backgroundEntities.size()<=0){
            log.error("Background details are Not found");
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_BACKGROUND_DETAILS)),
                    HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(backgroundEntities), HttpStatus.OK);
    }


    @Override
    public ResponseEntity<?> getAllBackgroundDetailsByCompanyEmployeeId(String companyId, String employeeId) throws EmployeeException,IOException {
        log.info("getting details of {}", employeeId);
        EmployeeEntity entity = null;
        CompanyEntity companyEntity;
        List<BackgroundEntity> backgroundEntities;

        companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS); // Adjust this call as needed

        if (companyEntity == null) {
            log.error("Company with ID {} not found", companyId);
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_COMPANY), companyId),
                    HttpStatus.NOT_FOUND);
        }
        String index = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
        entity = openSearchOperations.getEmployeeById(employeeId,null,index);

        if (entity == null) {
            log.error("Employee with ID {} not found", employeeId);
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_EMPLOYEE), companyId),
                    HttpStatus.NOT_FOUND);
        }
        try {
            backgroundEntities = openSearchOperations.getBackGroundDetailsOfEmployeeId(companyEntity.getShortName(),employeeId);
            for(BackgroundEntity bankEntity : backgroundEntities) {
                BackgroundUtils.unmaskBackgroundProperties(bankEntity);
            }
        } catch (Exception ex) {
            log.error("Exception while fetching bank details {}", ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_BACKGROUND_DETAILS),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (backgroundEntities == null || backgroundEntities.size()<=0){
            log.error("Background details are Not found for the employee"+employeeId);
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_BACKGROUND_DETAILS)),
                    HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(backgroundEntities), HttpStatus.OK);
    }

}