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
    private String companyId;
    private String employeeId;
    private String candidateId;
    private String firstName;
    private String lastName;
    private String emailId;
    private String password;
    private String designation;
    private String designationName;
    private String dateOfHiring;
    private String department;
    private String departmentName;
    private String currentGross;
    private String location;
    private String tempAddress;
    private String permanentAddress;
    private String manager;
    private String mobileNo;
    private String alternateNo;
    private String maritalStatus;
    private List<String> roles;
    private String status;
    private String panNo;
    private String uanNo;
    private String pfNo;
    private String aadhaarId;
    private String dateOfBirth;
    private String accountNo;
    private String ifscCode;
    private String bankName;
    private String bankBranch;
    private String profileImage;
    private String type;

    private Long otp;
    private Long expiryTime;
}
