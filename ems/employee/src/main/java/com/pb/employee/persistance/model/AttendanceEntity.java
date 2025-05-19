package com.pb.employee.persistance.model;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
public class AttendanceEntity implements Entity{

    private String attendanceId;
    private String employeeId;

    private String month;
    private String year;
    private String type;
    private String emailId;
    private String firstName;
    private String lastName;
    private String totalWorkingDays;
    private String noOfWorkingDays;



}