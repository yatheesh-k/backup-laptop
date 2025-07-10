package com.pb.employee.persistance.model.EmployeeAccounts;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.naming.ldap.PagedResultsControl;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeAccountsResponse {

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