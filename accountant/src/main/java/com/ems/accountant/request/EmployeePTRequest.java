package com.ems.accountant.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmployeePTRequest {

    private String employeeName;
    private String month;
    private String year;
    private String panNo;

    @Pattern(regexp = "^[0-9]+(\\.[0-9]{1,2})?$",  message = "{invalid.salaryAmount}")
    @Schema(example = "salary")
    private String salaryAmount;

}
