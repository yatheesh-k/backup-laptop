package com.ems.accountant.request;

import com.ems.accountant.validation.MonthValidation;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmployeeTdsRequest {
    @Schema(example = "xxx yyy")
    @Size(min = 2, max = 100, message = "{employee.size.message}")
    @Pattern(regexp = "^[A-Z][a-zA-Z]*(?:\\s[A-Z][a-zA-Z]*)*$", message = "{employee.name.message}")
    private String employeeName;

    @MonthValidation
    private String month;

    @Schema(example = "2024")
    @Size(min = 4, max = 4, message = "{year.size.message}")
    @Pattern(regexp = "^(19|20)\\d{2}$", message = "{year.message}")
    private String year;

    @Schema(example = "ABCDE1234F")
    @Pattern(regexp = "^[A-Z]{5}[0-9]{4}[A-Z]$", message = "{pan.message}")
    private String panNo;

    private String tds;
}
