package com.pb.employee.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.pb.employee.persistance.model.Entity;
import com.pb.employee.persistance.model.SalaryEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PayslipRequest {

    @NotBlank(message = "${companyname.message}")
    @Pattern(regexp = "^[a-z]+$", message = "${shortname.message}")
    private String companyName;

    @NotBlank(message = "{month.notnull.message}")
    @Pattern(regexp = "^[A-Z][a-z]*$", message = "${invalid.month}")
    private String month;

    @NotBlank(message = "${year.notnull.message}")
    @Pattern(regexp = "^\\d+$", message = "${invalid.year}")
    private String year;
}
