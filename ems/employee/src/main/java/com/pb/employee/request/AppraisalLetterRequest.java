package com.pb.employee.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class AppraisalLetterRequest {

    private String companyId;
    private String SalaryConfigurationId;
    private String employeeId;

    @Schema(example = "yyyy-mm-dd")
    @Pattern(regexp =  "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$", message = "{date.format}")
    @NotBlank(message = "{date.notnull.message}")
    private String date;

    @Schema(example = "yyyy-mm-dd")
    @Pattern(regexp =  "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$", message = "{date.format}")
    @NotBlank(message = "{date.notnull.message}")
    private String dateOfSalaryIncrement;

    @Schema(example = "grossAmount")
    @Pattern(regexp = "^\\d{5,20}$", message = "{grossAmount.format}")
    private String grossCompensation;


    @Schema(example = "salaryHikePersentage")
    @Pattern(regexp = "^(100(\\.0{1,2})?|[1-9]?\\d(\\.\\d{1,2})?|null|)$", message = "{salaryHikePersentage.format}")
    private String salaryHikePersentage;
}
