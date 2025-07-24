package com.ems.taxConsultant.persistance;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeResponse {

    private String id;
    private String firstName;
    private String lastName;
    private String emailId;
    private String uanNumber;
    private String panNo;
    private String aadhaarId;
    private String employeeSalary;
    private String tds;
    private String pfAmount;
    private String pfTax;

}
