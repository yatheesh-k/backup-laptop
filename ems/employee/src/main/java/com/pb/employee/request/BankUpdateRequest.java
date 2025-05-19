package com.pb.employee.request;


import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankUpdateRequest {

    @Schema(example = "accountType")
    @Size(min = 1, max = 35, message = "{accountType.notnull.message}")
    @Pattern(regexp = "^(?:[A-Z][a-z]*|[A-Z]+)(?: [A-Z][a-z]*| [A-Z]+)*$", message = "{accountType.message}")
    private String accountType;

    @Schema(example = "branch")
    @Pattern(regexp =  "^(?:[A-Z]{2,}(?:\\s[A-Z][a-z]+)*|[A-Z][a-z]+(?:\\s[A-Z][a-z]+)*|[A-Z]+(?:\\s[A-Z]+)*)$", message = "{branch.format}")
    @Size(min = 2, max = 100, message = "{branch.size.message}")
    private String branch;

    @Schema(example = "ifscCode")
    @Pattern(regexp = "^[A-Z]{4}0[A-Z0-9]{6}$", message = "{ifscCode.format}")
    @NotBlank(message = "{ifscCode.notnull.message}")
    private String ifscCode;

    @Schema(example = "address")
    @Pattern(regexp = "^(?!\\s)(.*?)(?<!\\s)$", message = "{location.format}")
    @Size(min = 2, max = 200, message = "{location.notnull.message}")
    private String address;

}