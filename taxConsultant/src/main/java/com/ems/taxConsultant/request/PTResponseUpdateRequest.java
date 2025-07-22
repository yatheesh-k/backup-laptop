package com.ems.taxConsultant.request;

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
public class PTResponseUpdateRequest {

    @Schema(example = "something")
    @Pattern(regexp = "^(|null|(?!\\s)(?=.*[A-Za-z])[A-Za-z0-9.,:;'#&*()^/\\s-]*[^\\s])$", message = "{notCompanyEmployees.message}")
    private String ignoredCompanyEmployees;

    @Schema(example = "something")
    @Pattern(regexp = "^(|null|(?!\\s)(?=.*[A-Za-z])[A-Za-z0-9.,:;'#&*()^/\\s-]*[^\\s])$", message = "{invalidPTAmounts.message}")
    private String invalidPTAmounts;

}
