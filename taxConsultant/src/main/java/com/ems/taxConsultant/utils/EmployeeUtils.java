package com.ems.taxConsultant.utils;

import com.ems.taxConsultant.persistance.EmployeeEntity;
import com.ems.taxConsultant.persistance.EmployeeResponse;
import com.ems.taxConsultant.persistance.EmployeeSalaryEntity;
import com.ems.taxConsultant.persistance.model.Entity;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

public class EmployeeUtils {

    public static Entity unmaskEmployeeProperties(EmployeeEntity employeeEntity) {
        String pan = null,uanNo=null,aadhaarId=null,accountNo=null,ifscCode=null, mobileNo=null, alterNo=null;
        if(employeeEntity.getPanNo() != null) {
            pan = new String((Base64.getDecoder().decode(employeeEntity.getPanNo().toString().getBytes())));
        }
        if(employeeEntity.getUanNo() != null) {
            uanNo = new String((Base64.getDecoder().decode(employeeEntity.getUanNo().toString().getBytes())));
        }
        if(employeeEntity.getAadhaarId() != null) {
            aadhaarId = new String((Base64.getDecoder().decode(employeeEntity.getAadhaarId().toString().getBytes())));
        }
        if(employeeEntity.getAccountNo() != null) {
            accountNo = new String((Base64.getDecoder().decode(employeeEntity.getAccountNo().toString().getBytes())));
        }
        if(employeeEntity.getIfscCode() != null) {
            ifscCode = new String((Base64.getDecoder().decode(employeeEntity.getIfscCode().toString().getBytes())));
        }
        if(employeeEntity.getMobileNo() != null) {
            mobileNo = new String((Base64.getDecoder().decode(employeeEntity.getMobileNo().toString().getBytes())));
        }
        if(employeeEntity.getAlternateNo() != null && !employeeEntity.getAlternateNo().isEmpty()) {
            alterNo = new String((Base64.getDecoder().decode(employeeEntity.getAlternateNo().toString().getBytes())));
        }
        employeeEntity.setIfscCode(ifscCode);
        employeeEntity.setAccountNo(accountNo);
        employeeEntity.setAadhaarId(aadhaarId);
        employeeEntity.setUanNo(uanNo);
        employeeEntity.setPassword("**********");
        employeeEntity.setPanNo(pan);
        employeeEntity.setAlternateNo(alterNo);
        employeeEntity.setMobileNo(mobileNo);
        return employeeEntity;
    }

    public static EmployeeResponse unMaskEmployeeAccountProperties(EmployeeSalaryEntity salaryEntity, EmployeeEntity employee) {
        String te= null, tax = null, itax = null, ttax = null, tded = null, net = null;
        Double pfEmpr = null, pfEmp= null;
        EmployeeResponse employeeResponse = new EmployeeResponse();

        if(salaryEntity.getPfTax() != null) {
            tax = new String((Base64.getDecoder().decode(salaryEntity.getPfTax().toString().getBytes())));
            double pfTax = Double.parseDouble(tax); // Parse tax to double
            employeeResponse.setPfTax(String.format("%.2f",pfTax/12));
        }
        if (salaryEntity.getIncomeTax() != null){
            itax = new String((Base64.getDecoder().decode(salaryEntity.getIncomeTax().toString().getBytes())));
            salaryEntity.setIncomeTax(itax);
            double incomeTax = Double.parseDouble(itax); // Parse itax to double
            employeeResponse.setTds(String.format("%.2f",incomeTax/12));
        }
        if(salaryEntity.getTotalEarnings() != null) {
            te = new String((Base64.getDecoder().decode(salaryEntity.getTotalEarnings().toString().getBytes())));
        }
        if(salaryEntity.getTotalDeductions() != null) {
            tded = new String((Base64.getDecoder().decode(salaryEntity.getTotalDeductions().toString().getBytes())));
        }
        if(salaryEntity.getTotalTax() != null) {
            ttax = new String((Base64.getDecoder().decode(salaryEntity.getTotalTax().toString().getBytes())));
        }
        if (salaryEntity.getNetSalary() != null) {
            double tdedValue = Double.parseDouble(tded);
            double ttaxValue = Double.parseDouble(ttax);
            double tEarValue = Double.parseDouble(te);

            double totalAmount = tdedValue+ttaxValue;
            double netAmount = tEarValue -totalAmount;
            employeeResponse.setEmployeeSalary(String.format("%.2f",netAmount/12));
        }

        if (salaryEntity.getSalaryConfigurationEntity().getDeductions() != null) {
            for (Map.Entry<String, String> entry : salaryEntity.getSalaryConfigurationEntity().getDeductions().entrySet()) {
                if (entry.getKey().equalsIgnoreCase("Provident Fund Employee")) {
                    String pfEmployer = unMaskValue(entry.getValue());
                    pfEmp = Double.parseDouble(pfEmployer); // Parse pf to double
                    employeeResponse.setPfAmount(String.format("%.2f",pfEmp/12));
                }
                if (entry.getKey().equalsIgnoreCase("Provident Fund Employer")) {
                    String pfEmployer = unMaskValue(entry.getValue());
                    pfEmpr = Double.parseDouble(pfEmployer); // Parse pf to double
                    employeeResponse.setPfAmount(String.format("%.2f", pfEmpr / 12));                }
            }
            employeeResponse.setPfAmount(String.valueOf((pfEmpr + pfEmp)));
            employeeResponse.setId(employee.getId());
            employeeResponse.setFirstName(employee.getFirstName());
            employeeResponse.setLastName(employee.getLastName());
            employeeResponse.setEmailId(employee.getEmailId());
            employeeResponse.setUanNumber(employee.getUanNo() != null ? employee.getUanNo() : null);
            employeeResponse.setAadhaarId(employee.getAadhaarId() != null ? employee.getAadhaarId() : null);
            employeeResponse.setPanNo(employee.getPanNo() != null ? employee.getPanNo() : null);
        }
        return employeeResponse;
    }

    private static String unMaskValue(String value) {
        if (value == null || value.isEmpty()) {
            return value; // Return as is if null or empty
        }
        return new String(Base64.getDecoder().decode(value)); // Correctly decode without extra bytes conversion
    }
}
