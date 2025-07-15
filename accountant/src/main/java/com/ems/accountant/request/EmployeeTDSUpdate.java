package com.ems.accountant.request;

import com.ems.accountant.validation.MonthValidation;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmployeeTDSUpdate {

    private String employeeName;
    @MonthValidation
    private String month;
    private String year;
    private String tds;
}
