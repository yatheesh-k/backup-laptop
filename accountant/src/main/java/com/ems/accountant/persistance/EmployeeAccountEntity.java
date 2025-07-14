package com.ems.accountant.persistance;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@Builder
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmployeeAccountEntity extends AbstractEntity {

    private String companyId;
    private String employeeName;
    private String employeeId;
    private String panNo;
    private String uanNo;
    private String aadhaarNumber;
    private String month;
    private String year;
    private String tds;
    private String professionalTax;
    private String providentFund;
}
