package com.ems.accountant.persistance;

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
public class PTResponseEntity extends AbstractEntity {

    private String month;
    private String year;
    private String companyId;
    private String ignoredCompanyEmployees;
    private String invalidPTAmounts;
}
