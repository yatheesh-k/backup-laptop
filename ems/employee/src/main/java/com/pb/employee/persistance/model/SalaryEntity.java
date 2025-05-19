package com.pb.employee.persistance.model;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.pb.employee.request.AllowanceRequest;
import com.pb.employee.request.DeductionRequest;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SalaryEntity implements Entity{

    private String salaryId;
    private String employeeId;
    private String basicSalary;
    private String fixedAmount;
    private String variableAmount;
    private String grossAmount;
    private String  totalEarnings;
    private String netSalary;
    private AllowanceEntity allowances;
    private DeductionEntity deductions;
    private String status;
    private String type;

}