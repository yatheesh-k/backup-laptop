package com.pb.employee.request;

import com.pb.employee.persistance.model.AttendanceEntity;
import com.pb.employee.persistance.model.EmployeeSalaryEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayslipUpdateRequest {

    @NotBlank(message = "${companyname.message}")
    @Pattern(regexp = "^[a-z]+$", message = "${shortname.message}")
    private String companyName;

    private EmployeeSalaryEntity salary;
    private AttendanceEntity attendance;

    @NotBlank(message = "{month.notnull.message}")
    @Pattern(regexp = "^[A-Z][a-z]*$", message = "${invalid.month}")
    private String month;

    @NotBlank(message = "${year.notnull.message}")
    @Pattern(regexp = "^\\d+$", message = "${invalid.year}")
    private String year;

    private String department;    // Store department when payslip is generated
    private String designation;

}
