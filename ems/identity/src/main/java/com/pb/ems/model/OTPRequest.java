package com.pb.ems.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OTPRequest{

    @Schema(required = true, description = "${login.otp.description}", example = "123456")
    private String otp;

    @NotEmpty(message = "{user.username.message}")
    @Schema(required = true,  description = "${login.username.description}", example = "path@gmail.com")
    private String username;

    @NotEmpty(message = "{user.company.message}")
    @Schema(required = true,  description = "${login.company.description}", example = "company")
    private String company;


}
