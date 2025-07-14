package com.ems.accountant.request;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PFResponseUpdateRequest {

    @Schema(example = "something")
    @Pattern(regexp = "^(|null|(?!\\s)(?=.*[A-Za-z])[A-Za-z0-9.,:;'#&*()^/\\s-]*[^\\s])$", message = "{notCompanyEmployees.message}")
    private String ignoredCompanyEmployees;

    @Schema(example = "something")
    @Pattern(regexp = "^(|null|(?!\\s)(?=.*[A-Za-z])[A-Za-z0-9.,:;'#&*()^/\\s-]*[^\\s])$", message = "{invalidPFAmounts.message}")
    private String invalidPFAmounts;

}
