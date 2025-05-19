package com.pb.employee.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.pb.employee.persistance.model.AllowanceEntity;
import com.pb.employee.persistance.model.DeductionEntity;
import com.pb.employee.persistance.model.SalaryConfigurationEntity;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class EmployeeSalaryResPayload {

    private String salaryId;
    private String employeeId;
    private String employeeName;
    private String employeeCreatedId;
    private String fixedAmount;
    private String variableAmount;
    private String grossAmount;
    private String totalEarnings;
    private String netSalary;
    private SalaryConfigurationEntity salaryConfigurationEntity;
    private String lop;
    private String totalDeductions;
    private String pfTax;
    private String incomeTax;
    private String totalTax;
    private String status;
    private String type;
}
