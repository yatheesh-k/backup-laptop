package com.pb.employee.persistance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class EmployeeSalaryEntity implements Entity {

    private String salaryId;
    private String employeeId;
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
