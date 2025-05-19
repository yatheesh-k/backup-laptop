package com.pb.employee.serviceImpl;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.DepartmentEntity;
import com.pb.employee.persistance.model.EmployeeEntity;
import com.pb.employee.persistance.model.Entity;
import com.pb.employee.request.DepartmentRequest;
import com.pb.employee.request.DepartmentUpdateRequest;
import com.pb.employee.request.EmployeeUpdateRequest;
import com.pb.employee.service.DepartmentService;
import com.pb.employee.util.CompanyUtils;
import com.pb.employee.util.Constants;
import com.pb.employee.util.ResourceIdUtils;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Slf4j
public class DepartmentServiceImpl implements DepartmentService {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Override
    public ResponseEntity<?> registerDepartment(DepartmentRequest departmentRequest) throws EmployeeException{
        // Check if a company with the same short or company name already exists
        log.debug("validating name {} exsited ", departmentRequest.getName());
        LocalDateTime currentDateTime = LocalDateTime.now();
        String timestamp = currentDateTime.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String resourceId = ResourceIdUtils.generateDepartmentResourceId(departmentRequest.getName(), timestamp);
        Object entity = null;
        String index = ResourceIdUtils.generateCompanyIndex(departmentRequest.getCompanyName());
        try{
            entity = openSearchOperations.getById(resourceId, null, index);
            if(entity != null) {
                log.error("department details existed{}", departmentRequest.getName());
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.DEPARTMENT_ID_ALREADY_EXISTS), departmentRequest.getName()),
                        HttpStatus.CONFLICT);
            }
        } catch (IOException e) {
            log.error("Unable to get the department details {}", departmentRequest.getName());
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_DEPARTMENT), departmentRequest.getName()),
                    HttpStatus.BAD_REQUEST);
        }
        boolean departmentPresent = openSearchOperations.isDepartmentPresent(departmentRequest.getCompanyName(), departmentRequest.getName());
        if(departmentPresent) {
            log.error("Department with name {} already existed", departmentRequest.getName());
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.DEPARTMENT_ID_ALREADY_EXISTS), departmentRequest.getName()),
                    HttpStatus.CONFLICT);
        }
        try{
            Entity departmentEntity = DepartmentEntity.builder().id(resourceId).name(departmentRequest.getName())
                    .type(Constants.DEPARTMENT).build();
            Entity result = openSearchOperations.saveEntity(departmentEntity, resourceId, index);
        } catch (Exception exception) {
            log.error("Unable to save the department details {} {}", departmentRequest.getName(),exception.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_DEPARTMENT),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<?> getDepartments(String companyName) throws EmployeeException {
        String index = ResourceIdUtils.generateCompanyIndex(companyName);

        List<DepartmentEntity> departmentEntities = null;
        try {
            departmentEntities = openSearchOperations.getCompanyDepartmentByName(companyName, null);

        } catch (Exception ex) {
            log.error("Exception while fetching departments for company {}: {}", companyName, ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (departmentEntities == null || departmentEntities.size()<=0){
            log.error("Department are Not found");
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_DEPARTMENT)),
                    HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(departmentEntities), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> getDepartmentById(String companyName, String departmentId) throws EmployeeException {
        log.info("getting details of {}", departmentId);
        DepartmentEntity entity = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        try {
            entity = openSearchOperations.getDepartmentById(departmentId, null, index);

        } catch (Exception ex) {
            log.error("Exception while fetching department details {}", ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DEPARTMENT),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (entity == null){
            log.error("Department with id {} is not found", departmentId);
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_DEPARTMENT), departmentId),
                    HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(entity), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> updateDepartmentById(String departmentId, DepartmentUpdateRequest departmentUpdateRequest) throws EmployeeException {
        log.info("getting details of {}", departmentId);
        DepartmentEntity departmentEntity;
        String index = ResourceIdUtils.generateCompanyIndex(departmentUpdateRequest.getCompanyName());
        try {

           departmentEntity = openSearchOperations.getDepartmentById(departmentId, null, index);
            if (departmentEntity == null) {
                log.error("unable to find the department");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_DEPARTMENT),
                        HttpStatus.NOT_FOUND);
            }

        } catch (Exception ex) {

            log.error("Exception while fetching department details {}", ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DEPARTMENT),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        List<DepartmentEntity> department = openSearchOperations.getCompanyDepartmentByName(departmentUpdateRequest.getCompanyName(), departmentUpdateRequest.getName());
        if(department !=null && department.size() > 0) {
            log.error("Department with name {} already existed", departmentUpdateRequest.getName());
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.DEPARTMENT_ID_ALREADY_EXISTS),  departmentUpdateRequest.getName()),
                    HttpStatus.CONFLICT);

        }
        Entity entity = DepartmentEntity.builder().id(departmentId).name(departmentUpdateRequest.getName())
                .type(Constants.DEPARTMENT).build();
        openSearchOperations.saveEntity(entity, departmentId, index);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> deleteDepartment(String companyName, String departmentId) throws EmployeeException {
        log.info("getting details of {}", departmentId);
        Object entity = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        List<EmployeeEntity> employeeEntities;

        try {
            entity = openSearchOperations.getById(departmentId, null, index);
            employeeEntities = openSearchOperations.getCompanyEmployees(companyName);
            for (EmployeeEntity employee: employeeEntities){
                    if (employee.getDepartment()!=null && employee.getDepartment().equals(departmentId)) {
                        log.error("department details existed in employee{}", departmentId);
                        return new ResponseEntity<>(
                                ResponseBuilder.builder().build().
                                        createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler
                                                .getMessage(EmployeeErrorMessageKey.DEPARTMENT_IS_EXIST_EMPLOYEE)))),
                                HttpStatus.CONFLICT);
                    }
            }
            if (entity!=null) {
                openSearchOperations.deleteEntity(departmentId,index);
            } else {
                log.error("unable to find department");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_DEPARTMENT),
                        HttpStatus.NOT_FOUND);
            }
        } catch (Exception ex) {
            log.error("Exception while fetching company details {}", ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_DELETE_DEPARTMENT),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED), HttpStatus.OK);

    }
}