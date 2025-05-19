package com.pb.employee.persistance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PayslipEntity implements Entity  {

    private String payslipId;
    private String employeeId;
    private  String salaryId;
    private String attendanceId;
    private EmployeeSalaryEntity salary;
    private AttendanceEntity attendance;
    private String month;
    private String year;
    private String inWords;
    private String type;

    private String department;    // Store department when payslip is generated
    private String designation;
}
