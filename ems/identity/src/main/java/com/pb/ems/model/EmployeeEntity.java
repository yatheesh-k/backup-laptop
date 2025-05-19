package com.pb.ems.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.pb.ems.persistance.Entity;
import lombok.*;

import java.util.Date;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@Builder
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmployeeEntity implements Entity {
    private String id;

    private String employeeType;
    private String type;
    private String emailId;
    private String password;
    private String companyId;
    private String status;

    private String employeeId;
    private String firstName;
    private String lastName;
    private String designation;
    private String dateOfHiring;
    private String department;
    private String location;
    private String manager;
    private List<String> roles;
    private String panNo;
    private String uanNo;
    private String aadhaarId;
    private String dateOfBirth;
    private String accountNo;
    private String ifscCode;
    private String bankName;

    private Long otp;
    private Long expiryTime;
    private String pfNo;

}
