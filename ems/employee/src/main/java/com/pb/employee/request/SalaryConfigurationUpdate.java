package com.pb.employee.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryConfigurationUpdate {

    private Map<
            @Pattern(regexp = "^[a-zA-Z&\\-\\s]+$", message = "{allowance.key.format}")
            @Size(min = 2, max = 30, message = "{allowance.key.size}") String,

            @Pattern(regexp = "^\\d+$", message = "{allowance.format}")
            @Size(min = 1, max = 20, message = "{allowance.size}") String> allowances;

    // Deductions: Key must be 2 to 30 characters (letters and spaces only), value must be digits (1 to 30)
    private Map<
            @Pattern(regexp = "^[a-zA-Z&\\-\\s]+$", message = "{deduction.key.format}")
            @Size(min = 2, max = 30, message = "{deduction.key.size}") String,

            @Pattern(regexp = "^\\d+$", message = "{deduction.format}")
            @Size(min = 1, max = 20, message = "{deduction.size}") String> deductions;

}
