package com.pb.employee.request;

import com.pb.employee.persistance.model.SalaryConfigurationEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSalaryRequest {

    @Schema(example = "companyShortName")
    @Pattern(regexp = "^[a-z]+$", message = "{companyName.format}")
    @NotBlank(message = "{companyname.message}")
    @Size(min = 2, max = 30, message = "{size.message}")
    private String companyName;

    @Schema(example = "fixedAmount")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "{fixedAmount.format}")
    @Size(min = 4, max = 20, message = "{fixedAmount.size.message}")
    private String fixedAmount;

    @Schema(example = "variableAmount")
    @Pattern(regexp = "^(|0|null|\\d+(\\.\\d{1,2})?)$", message = "{variableAmount.format}")
    private String variableAmount;

    @Schema(example = "grossAmount")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "{grossAmount.format}")
    @Size(min = 4, max = 20, message = "{grossAmount.size.message}")
    private String grossAmount;

    private SalaryConfigurationUpdate salaryConfigurationEntity;

    @Schema(example = "totalEarnings")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "{totalEarnings.format}")
    @Size(min = 4, max = 20, message = "{totalEarnings.size.message}")
    private String totalEarnings;

    @Schema(example = "netSalary")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "{netSalary.format}")
    @Size(min = 4, max = 20, message = "{netSalary.size.message}")
    private String netSalary;

    @Schema(example = "totalDeduction")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "{totalDeduction.format}")
    @Size(min = 2, max = 20, message = "{totalDeduction.size.message}")
    private String totalDeductions;

    @Schema(example = "incomeTax")
    @Pattern(regexp = "^(new|old)$", message = "{incomeTax.format}")
    @Size(min = 3, max = 4, message = "{incomeTax.size.message}")
    private String incomeTax;

    @Schema(example = "Active")
    @Pattern(regexp = "^(Active|InActive)$", message = "{status.format}")
    @NotBlank(message = "{status.notnull.message}")
    private String status;

    }
