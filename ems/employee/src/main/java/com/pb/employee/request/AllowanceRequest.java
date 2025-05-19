package com.pb.employee.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllowanceRequest {

    @Schema(example = "basicSalary")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "{basicSalary.format}")
    @Size(min = 4, max = 20, message = "{basicSalary.size.message}")
    private String basicSalary;

    @Schema(example = "hra")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "{hra.format}")
    @Size(min = 1, max = 3, message = "{hra.size}")
    private String hra;

    @Schema(example = "travelAllowance")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "{travelAllowance.format}")
    @Size(min = 3, max = 20, message = "{travelAllowance.size}")
    private String travelAllowance;

    @Schema(example = "pfContributionEmployee")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "{pfContributionEmployee.format}")
    @Size(min = 3, max = 20, message = "{pfContributionEmployee.size}")
    private String providentFundEmployer;


}
