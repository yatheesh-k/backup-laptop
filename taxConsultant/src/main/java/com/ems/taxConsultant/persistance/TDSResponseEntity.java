package com.ems.taxConsultant.persistance;


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
public class TDSResponseEntity extends AbstractEntity {

    private String companyId;
    private String month;
    private String year;
    private String ignoredCompanyEmployees;
    private String previousMonthMissedEmp;
    private String newAddedEmployees;
    private String invalidTDSAmounts;
}
