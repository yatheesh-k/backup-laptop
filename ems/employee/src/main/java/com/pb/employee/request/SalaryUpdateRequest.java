package com.pb.employee.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryUpdateRequest {

    @NotBlank(message = "${companyname.message}")
    @Pattern(regexp = "^[a-z]+$", message = "${shortname.message}")
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

    private SalaryConfigurationUpdate salaryConfigurationRequest;

    @Schema(example = "totalEarnings")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "{totalEarnings.format}")
    @Size(min = 4, max = 20, message = "{totalEarnings.size.message}")
    private String totalEarnings;

    @Schema(example = "netSalary")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "{netSalary.format}")
    @Size(min = 4, max = 20, message = "{netSalary.size.message}")
    private String netSalary;

    @Schema(example = "totalDeduction")
    private String totalDeductions;

    @Schema(example = "incomeTax")
    private String incomeTax;

    @Schema(example = "status")
    @Pattern(regexp = "^[A-Za-z]+(?:\\s[A-Za-z]+)*$", message = "{status.format}")
    @NotBlank(message = "{status.notnull.message}")
    private String status;

}
