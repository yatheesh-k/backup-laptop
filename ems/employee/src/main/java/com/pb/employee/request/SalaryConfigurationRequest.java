package com.pb.employee.request;

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
public class SalaryConfigurationRequest {

    @Schema(example = "companyShortName")
    @Pattern(regexp = "^[a-z]+$", message = "{companyName.format}")
    @NotBlank(message = "{companyname.message}")
    @Size(min = 2, max = 30, message = "{size.message}")
    private String companyName;

    private Map<
            @Pattern(regexp = "^[a-zA-Z&\\-\\s]+$", message = "{allowance.key.format}")
            @Size(min = 2, max = 50, message = "{allowance.key.size}") String,

            @Pattern(regexp = "^(\\d+|\\d+%)$", message = "{allowance.format}")
            @Size(min = 1, max = 30, message = "{allowance.size}") String> allowances;

    // Deductions: Key must be 2 to 30 characters (letters and spaces only), value must be digits (1 to 30)
    private Map<
            @Pattern(regexp = "^[a-zA-Z&\\-\\s]+$", message = "{deduction.key.format}")
            @Size(min = 2, max = 50, message = "{deduction.key.size}") String,

            @Pattern(regexp = "^(\\d+|\\d+%)$", message = "{deduction.format}")
            @Size(min = 1, max = 30, message = "{deduction.size}") String> deductions;

    @Schema(example = "Active")
    @Pattern(regexp = "^(Active|InActive)$", message = "{status.format}")
    @NotBlank(message = "{status.notnull.message}")
    private String status;
}
