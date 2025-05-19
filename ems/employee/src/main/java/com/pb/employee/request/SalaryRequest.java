package com.pb.employee.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryRequest {

    @Schema(example = "companyShortName")
    @Pattern(regexp = "^[a-z]+$", message = "{companyName.format}")
    @NotBlank(message = "{companyname.message}")
    @Size(min = 2, max = 30, message = "{size.message}")
    private String companyName;

    @Schema(example = "basicSalary")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "{basicSalary.format}")
    @Size(min = 4, max = 20, message = "{basicSalary.size.message}")
    private String basicSalary;

    @Schema(example = "fixedAmount")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "{fixedAmount.format}")
    @Size(min = 4, max = 20, message = "{fixedAmount.size.message}")
    private String fixedAmount;

    @Schema(example = "variableAmount")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "{variableAmount.format}")
    @Size(min = 4, max = 20, message = "{variableAmount.size.message}")
    private String variableAmount;

    @Schema(example = "grossAmount")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "{grossAmount.format}")
    @Size(min = 4, max = 20, message = "{grossAmount.size.message}")
    private String grossAmount;

    @Schema(example = "totalEarnings")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "{totalEarnings.format}")
    @Size(min = 4, max = 20, message = "{totalEarnings.size.message}")
    private String totalEarnings;

    @Schema(example = "netSalary")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "{netSalary.format}")
    @Size(min = 4, max = 20, message = "{netSalary.size.message}")
    private String netSalary;

    @Valid
    private AllowanceRequest allowances;

    @Valid
    private DeductionRequest deductions;

    @Schema(example = "Active")
    @Pattern(regexp = "^(Active|InActive)$", message = "{status.format}")
    @NotBlank(message = "{status.notnull.message}")
    private String status;
}