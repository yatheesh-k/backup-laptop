package com.pb.employee.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class InternshipRequest {

    private String companyId;

    @Schema(example = "yyyy-mm-dd")
    @Pattern(regexp =  "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$", message = "{date.format}")
    @NotBlank(message = "{date.notnull.message}")
    private String date;

    @Schema(example = "employeeName")
    @Pattern(regexp = "^(?:[A-Z]{2,}(?:\\s[A-Z][a-z]+)*|[A-Z][a-z]+(?:\\s[A-Z][a-z]+)*|[A-Z]+(?:\\s[A-Z]+)*)$",
            message = "{firstname.format}")
    @Size(min = 3, max = 20, message = "{firstName.size.message}")
    private String employeeName;

    @Schema(example = "department")
    @Pattern(regexp = "^(?!\\s)(.*?)(?<!\\s)$",
            message = "{department.format}")
    @Size(min = 1, max = 40, message = "{department.size.message}")
    private String department;

    @Schema(example = "yyyy-mm-dd")
    @Pattern(regexp =  "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$", message = "{date.format}")
    @NotBlank(message = "{date.notnull.message}")
    private String startDate;

    @Schema(example = "yyyy-mm-dd")
    @Pattern(regexp =  "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$", message = "{date.format}")
    @NotBlank(message = "{date.notnull.message}")
    private String endDate;

    @Schema(example = "designation")
    @Pattern(regexp = "^(?!\\s)(.*?)(?<!\\s)$",
            message = "{designation.format}")
    @Size(min = 1, max = 40, message = "{designation.size.message}")
    private String designation;

}
