package com.invoice.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRequest {

    @NotBlank(message = "{username.notnull.message}")
    @Size(min = 2, max = 50, message = "{userName.size.message}")
    private String userName;

    @NotBlank(message = "{userEmail.notnull.message}")
    @Email(message = "{userEmail.format.message}")
    private String userEmail;

    @NotBlank(message = "{password.notnull.message}")
    @Size(min = 8, max = 100, message = "{password.size.message}")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", message = "{password.pattern.message}")
    private String password;

    @NotBlank(message = "{role.notnull.message}")
    @Pattern(regexp = "^(Admin|Employee)$", message = "{role.format.message}")
    private String role;
}
