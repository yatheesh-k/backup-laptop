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
public class DesignationRequest {

    @Schema(example = "companyShortName")
    @Pattern(regexp = "^[a-z]+$", message = "{companyName.format}")
    @NotBlank(message = "{companyname.message}")
    @Size(min = 2, max = 30, message = "{size.message}")
    private String companyName;

    @Schema(example = "designation")
    @Pattern(regexp = "^(?:[A-Z][a-z]*|[A-Z]+)(?: [A-Z][a-z]*| [A-Z]+)*$", message = "{designation.format}")
    @Size(min = 1, max = 40, message = "{designation.size.message}")
    private String name;
}
