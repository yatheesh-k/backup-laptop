package com.ems.accountant.request;

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
public class EmployeeTDSRequest {
    @Schema(example = "xxx yyy")
    @Size(min = 2, max = 100, message = "{employee.size.message}")
    @Pattern(regexp = "^[A-Z][a-zA-Z]*(?:\\s[A-Z][a-zA-Z]*)*$", message = "{employee.name.message}")
    private String employeeName;

    @Schema(example = "1800")
    @Pattern(regexp = "^[0-9]+(\\.[0-9]{1,2})?$", message = "{tds.message}")
    private String tds;
}
