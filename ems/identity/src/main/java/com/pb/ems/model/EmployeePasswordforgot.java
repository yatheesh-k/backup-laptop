package com.pb.ems.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class EmployeePasswordforgot {
    @NotEmpty(message = "{user.username.message}")
    @Schema(required = true,  description = "${login.username.description}", example = "admin")
    @JsonProperty("username")
    private String username;

    @NotEmpty(message = "{user.password.message}")
    @Schema(required = true,  description = "${login.password.description}", example = "password")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\\W)(?!.* ).{6,16}$", message = "{    invalid.password}")
    @JsonProperty("password")
    private String password;

    @NotEmpty(message = "{user.company.message}")
    @Schema(required = true,  description = "${login.company.description}", example = "pathbreaker")
    @JsonProperty("company")
    private String company;

}
