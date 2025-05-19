package com.pb.employee.serviceImpl;

import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.DeductionEntity;
import com.pb.employee.persistance.model.SalaryConfigurationEntity;
import com.pb.employee.request.AllowanceRequest;
import com.pb.employee.request.EmployeeStatus;
import com.pb.employee.request.SalaryConfigurationRequest;
import com.pb.employee.service.SalaryConfigurationService;
import com.pb.employee.util.CompanyUtils;
import com.pb.employee.util.Constants;
import com.pb.employee.util.ResourceIdUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class SalaryConfigurationServiceImpl implements SalaryConfigurationService {

    @Autowired
    private OpenSearchOperations openSearchOperations;

    // Helper method to format field names from camelCase to "Human Readable Format"
    private String formatFieldName(String fieldName) {

        if (fieldName.equalsIgnoreCase(Constants.HRA_SMALL)) {
            return Constants.HRA; // Ensure it's always uppercase
        }
        // Split the camelCase field name into separate words
        String[] words = fieldName.split("(?=[A-Z])");

        // Capitalize the first letter of each word and join them with spaces
        return Arrays.stream(words)
                .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }


    @Override
    public List<String> getAllowanceColumnNames() {
        // Get the Class object for AllowanceRequest
        Class<?> clazz = AllowanceRequest.class;

        // Retrieve all fields from the class
        Field[] fields = clazz.getDeclaredFields();

        // Extract the names of the fields and format them
        return Arrays.stream(fields)
                .map(field -> formatFieldName(field.getName())) // Format each field name
                .collect(Collectors.toList());
    }
    @Override
    public List<String> getDeductionsColumnNames() {
        // Get the Class object for AllowanceRequest
        Class<?> clazz = DeductionEntity.class;

        // Retrieve all fields from the class
        Field[] fields = clazz.getDeclaredFields();

        // Extract the names of the fields
        return Arrays.stream(fields)
                .map(field -> formatFieldName(field.getName())) // Format each field name
                .collect(Collectors.toList());
    }

    @Override
    public ResponseEntity<?> SalaryColumns(SalaryConfigurationRequest salaryConfigurationRequest) throws EmployeeException {
        LocalDateTime currentDateTime = LocalDateTime.now();
        String timestamp = currentDateTime.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String resourceId = ResourceIdUtils.generateSalaryConfigurationResourceId(salaryConfigurationRequest.getCompanyName(), timestamp);
        String index = ResourceIdUtils.generateCompanyIndex(salaryConfigurationRequest.getCompanyName());

        List<SalaryConfigurationEntity> salaryConfigurationEntities = null;

        try {
            // Retrieve existing salary configurations
            salaryConfigurationEntities = openSearchOperations.getSalaryStructureByCompanyDate(salaryConfigurationRequest.getCompanyName());
//            for (SalaryConfigurationEntity existingConfig : salaryConfigurationEntities) {
//                if (existingConfig != null) {
//                    boolean areAllowancesEqual = areAllowancesEqual(existingConfig.getAllowances(), salaryConfigurationRequest.getAllowances());
//                    if (areAllowancesEqual) {
//                        return new ResponseEntity<>(
//                                ResponseBuilder.builder().build().
//                                        createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler
//                                                .getMessage(EmployeeErrorMessageKey.COMPANY_SALARY_ALREADY_EXIST)))),
//                                HttpStatus.CONFLICT);
//                    } else {
//                        existingConfig.setStatus(EmployeeStatus.INACTIVE.getStatus());
//                        openSearchOperations.saveEntity(existingConfig, existingConfig.getId(), index);
//                    }
//                }

            if (salaryConfigurationEntities != null && salaryConfigurationEntities.size()!=0){
                log.error("Company Salary is already exist", salaryConfigurationEntities.getFirst().getId());
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().
                                createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler
                                        .getMessage(EmployeeErrorMessageKey.COMPANY_SALARY_ALREADY_EXIST)))),
                        HttpStatus.CONFLICT);
            }


            SalaryConfigurationEntity salaryStructure = CompanyUtils.maskSalaryStructureProperties(salaryConfigurationRequest, resourceId);
            openSearchOperations.saveEntity(salaryStructure, resourceId, index);
        } catch (Exception exception) {
            log.error("Unable to save the allowances details", exception);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_COMPANY_SALARY),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    private boolean areAllowancesEqual(Map<String, String> existingAllowances, Map<String, String> newAllowances) {
        if (existingAllowances.size() != newAllowances.size()) {
            return false;
        }
        for (Map.Entry<String, String> entry : existingAllowances.entrySet()) {
            String key = entry.getKey();
            String existingValue = new String(Base64.getDecoder().decode(entry.getValue()));
            String newValue = newAllowances.get(key);

            double existingAmount = Double.parseDouble(existingValue);
            double newAmount = newValue != null ? Double.parseDouble(newValue) : 0;

            if (existingAmount != newAmount) {
                return false;
            }
        }
        // All allowances matched
        return true;
    }

    @Override
    public ResponseEntity<?> getSalaryStructureByCompany(String companyName) throws EmployeeException {
        List<SalaryConfigurationEntity> salaryConfigurationEntity;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        try{
            salaryConfigurationEntity = openSearchOperations.getSalaryStructureByCompanyDate(companyName);
            if (salaryConfigurationEntity!= null) {
                for (SalaryConfigurationEntity salaryConfiguration : salaryConfigurationEntity) {
                    CompanyUtils.unMaskCompanySalaryStructureProperties(salaryConfiguration);
                }
            }
        }catch (Exception exception){
            log.error("Unable to get Salary Feild", exception.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_SALARY_STRUCTURE),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(salaryConfigurationEntity), HttpStatus.OK);
    }
}
