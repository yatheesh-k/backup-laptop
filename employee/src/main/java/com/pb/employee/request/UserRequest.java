package com.pb.employee.request;

import com.pb.employee.validations.RoleValidation;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import javax.annotation.Nullable;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRequest {

    private String employeeId;

    @Schema(example = "firstName")
    @Pattern(regexp = "^(?:[A-Z]{2,}(?:\\s[A-Z][a-z]+)*|[A-Z][a-z]+(?:\\s[A-Z][a-z]+)*|[A-Z]+(?:\\s[A-Z]+)*)$", message = "{firstname.format}")
    private String firstName;

    @Schema(example = "lastName")
    @Pattern(regexp = "^(?:[A-Z]{2,}(?:\\s[A-Z][a-z]+)*|[A-Z][a-z]+(?:\\s[A-Z][a-z]+)*|[A-Z]+(?:\\s[A-Z]+)*)$", message = "{lastname.format}")
    private String lastName;

    @Schema(example = "emailId")
    @Pattern(regexp = "^(?=.*[a-z])[a-z0-9._%+-]*[a-z][a-z0-9._%+-]*@[a-z0-9.-]+\\.[a-z]{2,6}$", message = "{invalid.emailId}")
    @NotBlank(message = "{emailId.notnull.message}")
    private String emailId;

    @Schema(example = "userType")
    @Pattern(regexp = "^(Admin|HR|Accountant)$", message = "{user.type}")
    @Size(min = 2, max = 20, message = "{userType.size.message}")
    private String userType;

    private String department;

    @RoleValidation
    private List<String> roles;
}

