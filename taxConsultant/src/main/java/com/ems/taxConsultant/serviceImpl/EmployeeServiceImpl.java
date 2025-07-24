package com.ems.taxConsultant.serviceImpl;

import com.ems.taxConsultant.elasticSearch.OpenSearchOperations;
import com.ems.taxConsultant.exception.ErrorMessageHandler;
import com.ems.taxConsultant.exception.ErrorMessageKey;
import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.persistance.EmployeeEntity;
import com.ems.taxConsultant.persistance.EmployeeResponse;
import com.ems.taxConsultant.persistance.EmployeeSalaryEntity;
import com.ems.taxConsultant.service.EmployeeService;
import com.ems.taxConsultant.utils.Constants;
import com.ems.taxConsultant.utils.EmployeeUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Override
    public List<EmployeeResponse> getEmployeeResponseDetails(String companyName) throws TaxConsultantException {
        List<EmployeeEntity> employeeEntities;
        List<EmployeeResponse> employeeResponses = new ArrayList<>();
        try {
            employeeEntities = openSearchOperations.getCompanyEmployees(companyName);

            for (EmployeeEntity employee : employeeEntities) {
                if (employee.getStatus().equalsIgnoreCase(Constants.ACTIVE) && !employee.getEmployeeType().equalsIgnoreCase(Constants.ADMIN)) {
                    EmployeeUtils.unmaskEmployeeProperties(employee);
                    List<EmployeeSalaryEntity> salaries = openSearchOperations.getEmployeeSalaries(companyName, employee.getId(), Constants.ACTIVE);
                    if (salaries != null && !salaries.isEmpty()) {
                        EmployeeSalaryEntity activeSalary = salaries.get(0);
                        EmployeeResponse response = EmployeeUtils.unMaskEmployeeAccountProperties(activeSalary, employee);
                        employeeResponses.add(response);
                    }
                }
            }
        } catch (Exception ex) {
            log.error("Error fetching employee TDS details for {}: {}", companyName, ex.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_GET_EMPLOYEES), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return employeeResponses;
    }
}
