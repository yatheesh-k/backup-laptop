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
public class PFResponseRequest {

    @MonthValidation
    private String month;

    @Schema(example = "2024")
    @Size(min = 4, max = 4, message = "{year.size.message}")
    @Pattern(regexp = "^(19|20)\\d{2}$", message = "{year.message}")
    private String year;

    @Schema(example = "something")
    @Pattern(regexp = "^(|null|(?!\\s)(?=.*[A-Za-z])[A-Za-z0-9.,:;'#&*()^/\\s-]*[^\\s])$", message = "{notCompanyEmployees.message}")
    private String notCompanyEmployees;

    @Schema(example = "something")
    @Pattern(regexp = "^(|null|(?!\\s)(?=.*[A-Za-z])[A-Za-z0-9.,:;'#&*()^/\\s-]*[^\\s])$", message = "{invalidPFAmounts.message}")
    private String invalidPFAmounts;

}
