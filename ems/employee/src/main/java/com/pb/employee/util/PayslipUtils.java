package com.pb.employee.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.PayslipRequest;
import com.pb.employee.request.PayslipUpdateRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.text.DecimalFormat;
import java.util.*;

@Component
@Service
@Slf4j
public class PayslipUtils {

    public static PayslipEntity unMaskEmployeePayslipProperties(EmployeeSalaryEntity salaryRequest, PayslipRequest payslipRequest, String id, String employeeId, AttendanceEntity attendanceEntity) {
        Double var = null, fix = null, bas, gross = null;
        Double te = null, pfE = null, pfEmployer = null, lop = null, tax = null, itax = null, ttax = null, tded = null, net = null;
        int totalWorkingDays = 0, noOfWorkingDays=0;
        double basic;
        String email=null, firstname=null, lastName=null;

        ObjectMapper objectMapper = new ObjectMapper();


        AttendanceEntity attendance = objectMapper.convertValue(attendanceEntity,AttendanceEntity.class);
        EmployeeSalaryEntity salary = objectMapper.convertValue(salaryRequest,EmployeeSalaryEntity.class);


        if (attendance.getNoOfWorkingDays() !=null){
            byte[] decodedFix = Base64.getDecoder().decode(attendance.getNoOfWorkingDays());
            noOfWorkingDays= Integer.parseInt(new String(decodedFix));
            attendance.setNoOfWorkingDays(String.valueOf(noOfWorkingDays));
        }
        if (attendance.getTotalWorkingDays() !=null){
            byte[] decodedFix = Base64.getDecoder().decode(attendance.getTotalWorkingDays());
            totalWorkingDays= Integer.parseInt(new String(decodedFix));
            attendance.setTotalWorkingDays(String.valueOf(totalWorkingDays));
        }
        if (attendance.getEmailId() !=null){
            byte[] decodedFix = Base64.getDecoder().decode(attendance.getEmailId());
            email= new String(decodedFix);
            attendance.setEmailId(email);

        }
        if (attendance.getFirstName() !=null){
            byte[] decodedFix = Base64.getDecoder().decode(attendance.getFirstName());
            firstname= new String(decodedFix);
            attendance.setFirstName(firstname);
        }
        if (attendance.getLastName() !=null){
            byte[] decodedFix = Base64.getDecoder().decode(attendance.getLastName());
            lastName= new String(decodedFix);
            attendance.setLastName(lastName);
        }
        if (salaryRequest.getVariableAmount() != null) {
            byte[] decodedVar = Base64.getDecoder().decode(salaryRequest.getVariableAmount());
            var = Double.parseDouble(new String(decodedVar));
            salary.setVariableAmount(String.valueOf(var));
        }

        if (salaryRequest.getFixedAmount() != null) {
            byte[] decodedFix = Base64.getDecoder().decode(salaryRequest.getFixedAmount());
            fix = Double.parseDouble(new String(decodedFix));
            salary.setFixedAmount(String.valueOf(fix));

        }

        if (salaryRequest.getGrossAmount() != null) { //annual
            byte[] decodedGross = Base64.getDecoder().decode(salaryRequest.getGrossAmount());
            gross = Double.parseDouble(new String(decodedGross));
            salary.setGrossAmount(String.valueOf(gross));
        }

        if (noOfWorkingDays == 0){
            tax = 0.0;
            ttax = 0.0;
            itax=0.0;
            salary.setTotalTax(String.valueOf(ttax));
            salary.setPfTax(String.valueOf(tax));
            salary.setIncomeTax(String.valueOf(itax));
        }else {
            if (salaryRequest.getPfTax() != null) {
                byte[] decodedTax = Base64.getDecoder().decode(salaryRequest.getPfTax());
                tax = Double.parseDouble(new String(decodedTax));
                tax = tax / 12.0;
                salary.setPfTax(String.valueOf(Math.round(tax)));
            }
            if (salaryRequest.getIncomeTax() != null) {
                byte[] decodedItax = Base64.getDecoder().decode(salaryRequest.getIncomeTax());
                itax = Double.parseDouble(new String(decodedItax));
                itax = itax / 12.0;
                salary.setIncomeTax(String.valueOf(Math.round(itax)));

            }
            if (salaryRequest.getTotalTax() != null) {
                ttax = tax + itax;
                ttax = (double) Math.round(ttax);
                salary.setTotalTax(String.valueOf(ttax));
            }
        }
        double allowance = 0.0;
        if(salaryRequest.getSalaryConfigurationEntity().getAllowances() != null) {
            Map<String, String> decodedAllowances = new HashMap<>();

            for (Map.Entry<String, String> entry : salaryRequest.getSalaryConfigurationEntity().getAllowances().entrySet()) {
                String unmaskedValue = unMaskValue(entry.getValue());
                String calculatedValue = persentageOrValue(unmaskedValue, gross);
                decodedAllowances.put(entry.getKey(), calculatedValue);

                // Sum the allowances
                allowance += Double.parseDouble(calculatedValue);
            }
            salary.getSalaryConfigurationEntity().setAllowances(decodedAllowances);

        }


        double totalDeduction = 0.0;
        if (salaryRequest.getSalaryConfigurationEntity().getDeductions() != null) {
            Map<String, String> decodeDeductions = new HashMap<>();

            if (noOfWorkingDays == 0) {
                for (Map.Entry<String, String> entry : salaryRequest.getSalaryConfigurationEntity().getDeductions().entrySet()) {
                    decodeDeductions.put(entry.getKey(), String.valueOf(0));
                    totalDeduction = 0;
                }
                salary.getSalaryConfigurationEntity().setDeductions(decodeDeductions);
            } else {
                for (Map.Entry<String, String> entry : salaryRequest.getSalaryConfigurationEntity().getDeductions().entrySet()) {
                    String key = entry.getKey();
                    String unmaskValues = unMaskValue(entry.getValue());
                    String calculatedValue = persentageOrValue(unmaskValues, gross);

                    // Check if working days are less than 15 and deduction type is PF Employee or PF Employer
                    if (noOfWorkingDays < 15 && (key.equalsIgnoreCase(Constants.PF_EMPLOYEE) || key.equalsIgnoreCase(Constants.PF_EMPLOYER))) {
                        // Divide by 2 if noOfWorkingDays < 15 for PF Employee and PF Employer
                        calculatedValue = String.valueOf(Double.parseDouble(calculatedValue) / 2);
                    }
                    decodeDeductions.put(key, calculatedValue);
                    totalDeduction += Double.parseDouble(calculatedValue);
                }

                salary.getSalaryConfigurationEntity().setDeductions(decodeDeductions);
            }
        }

        if (salaryRequest.getTotalEarnings() != null){
            te = allowance;
            salary.setTotalEarnings(String.valueOf(Math.round(te)));
        }
        if (noOfWorkingDays ==0){
            lop = te;
            totalDeduction +=lop;
        }else {
            int noOfLeaves = totalWorkingDays - noOfWorkingDays;
            if (noOfLeaves > 1) {
                double monthlySalary = (gross / 12);
                double perDaySalary = Math.round(monthlySalary / totalWorkingDays);
                lop = (noOfLeaves - 1) * perDaySalary;
                lop = (double) Math.round(lop);
                totalDeduction += lop;

            }else {
                lop = (double) 0;
            }
        }
        salary.setLop(String.valueOf(lop));
        salary.setTotalDeductions(String.valueOf(Math.round(totalDeduction)));



        net = te-totalDeduction-ttax;
        salary.setNetSalary(String.valueOf(Math.round(net)));


        PayslipEntity payslipEntity = objectMapper.convertValue(payslipRequest, PayslipEntity.class);

        payslipEntity.setPayslipId(id);
        payslipEntity.setAttendanceId(attendance.getAttendanceId());
        payslipEntity.setMonth(payslipRequest.getMonth());
        payslipEntity.setYear(payslipRequest.getYear());
        payslipEntity.setEmployeeId(employeeId);
        payslipEntity.setSalaryId(salaryRequest.getSalaryId());
        payslipEntity.setSalary(salary);
        payslipEntity.setAttendance(attendance);
        String inWords =  numberToWords(Double.valueOf(net));
        payslipEntity.setInWords(inWords + " Rupees Only.");
        payslipEntity.setType(Constants.PAYSLIP);


        return payslipEntity;
    }

    private static String persentageOrValue(String decodedString, double grossAmount) {
        String result;
        if (decodedString.endsWith("%")){
            String percentageString = decodedString.replace("%", "");
            double percentage = Double.parseDouble(percentageString)/100;
            double monthlyValue = (percentage*grossAmount)/12;
            monthlyValue = Math.round(monthlyValue);
            result = String.valueOf(monthlyValue);

            return result;
        }else {
            double monthlyValue = Double.parseDouble(decodedString)/12;
            result = String.valueOf(Math.round(monthlyValue));
            return result;
        }
    }
    private static String persentageOrValueForYearly(String decodedString, double grossAmount) {
        String result;
        if (decodedString.endsWith("%")){
            String percentageString = decodedString.replace("%", "");
            double percentage = Double.parseDouble(percentageString)/100;
            double monthlyValue = (percentage*grossAmount);
            monthlyValue = Math.round(monthlyValue);
            result = String.valueOf(monthlyValue);

            return result;
        }else {
            double monthlyValue = Double.parseDouble(decodedString);
            result = String.valueOf(Math.round(monthlyValue));
            return result;
        }
    }


    public static PayslipEntity maskEmployeePayslip(PayslipEntity payslipRequest, EmployeeSalaryEntity salaryRequest, AttendanceEntity attendance) {
        String var = null, fix = null, bas = null, gross = null;
        String hra = null, trav = null, pfc = null, other = null, spa = null;
        String te = null, pfE = null, pfEmployer = null, lop = null, tax = null, itax = null, ttax = null, tded = null, net = null;
        Map<String, String> allowances = new HashMap<>();
        Map<String, String> deductions = new HashMap<>();


        if (payslipRequest.getSalary().getFixedAmount() != null) {
            fix = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getFixedAmount()).getBytes());
        }
        if (payslipRequest.getSalary().getVariableAmount() != null) {
            var = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getVariableAmount()).getBytes());
        }
        if (payslipRequest.getSalary().getGrossAmount() != null) { //annual
            gross  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getGrossAmount()).getBytes());
        }
        if (payslipRequest.getSalary().getTotalEarnings() != null) { //annual
            te  =Base64.getEncoder().encodeToString((payslipRequest.getSalary().getTotalEarnings()).getBytes());
        }
        if (payslipRequest.getSalary().getNetSalary() != null) { //annual
            net  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getNetSalary()).getBytes());
        }
        if (payslipRequest.getSalary().getTotalDeductions() != null) { //annual
            tded  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getTotalDeductions()).getBytes());
        }
        if (payslipRequest.getSalary().getIncomeTax() != null) { //annual
            itax  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getIncomeTax()).getBytes());
        }
        if (payslipRequest.getSalary().getPfTax() != null) { //annual
            tax  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getPfTax()).getBytes());
        }
        if (payslipRequest.getSalary().getTotalTax() != null) { //annual
            ttax  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getTotalTax()).getBytes());
        }
        if (payslipRequest.getSalary().getLop() != null) { //annual
            lop  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getLop()).getBytes());
        }

        if (payslipRequest.getSalary().getSalaryConfigurationEntity().getAllowances() != null) {
            for (Map.Entry<String, String> entry : payslipRequest.getSalary().getSalaryConfigurationEntity().getAllowances().entrySet()) {
                allowances.put(entry.getKey(), maskValue(entry.getValue()));
            }
        }
        if (payslipRequest.getSalary().getSalaryConfigurationEntity().getDeductions() != null) {
            for (Map.Entry<String, String> entry : payslipRequest.getSalary().getSalaryConfigurationEntity().getDeductions().entrySet()) {
                deductions.put(entry.getKey(), maskValue(entry.getValue()));
            }
        }

        ObjectMapper objectMapper = new ObjectMapper();
        AttendanceEntity attendanceEntity = objectMapper.convertValue(attendance,AttendanceEntity.class);
        attendanceEntity.setMonth(attendance.getMonth());
        attendanceEntity.setYear(attendance.getYear());
        attendanceEntity.setTotalWorkingDays(attendance.getTotalWorkingDays());
        attendanceEntity.setNoOfWorkingDays(attendance.getNoOfWorkingDays());

        PayslipEntity payslipEntity = objectMapper.convertValue(payslipRequest, PayslipEntity.class);
        EmployeeSalaryEntity salary = objectMapper.convertValue(salaryRequest,EmployeeSalaryEntity.class);
        salary.setFixedAmount(fix);
        salary.setGrossAmount(gross);
        salary.setVariableAmount(var);
        salary.setTotalEarnings(te);
        salary.setNetSalary(net);
        salary.setTotalDeductions(tded);
        salary.setIncomeTax(itax);
        salary.getSalaryConfigurationEntity().setAllowances(allowances);
        salary.getSalaryConfigurationEntity().setDeductions(deductions);
        salary.setPfTax(tax);
        salary.setTotalTax(ttax);
        salary.setLop(lop);
        payslipEntity.setSalary(salary);
        payslipEntity.setAttendance(attendanceEntity);
        payslipEntity.setType(Constants.PAYSLIP);
        return payslipEntity;
    }

    private static String unMaskValue(String value) {
        if (value == null || value.isEmpty()) {
            return value; // Return as is if null or empty
        }
        return new String(Base64.getDecoder().decode(value)); // Correctly decode without extra bytes conversion
    }


    public static PayslipEntity unmaskEmployeePayslip(PayslipEntity payslipRequest) {

        String var = null, fix = null, bas = null, gross = null, department = null, designation = null,
                hra = null, trav = null, pfc = null, other = null,spa=null,
                te= null, email = null, pfEmployer =null, lop = null, tax = null,
                itax = null, ttax = null, tded = null, net = null,noOfWorkingDays=null,totalWorkingDays=null,
                firstName=null, lastName =null;

        if (payslipRequest.getSalary().getFixedAmount() != null) {
            fix = new String(Base64.getDecoder().decode(payslipRequest.getSalary().getFixedAmount()));
        }
        if (payslipRequest.getSalary().getVariableAmount() != null) {
            var = new String(Base64.getDecoder().decode(payslipRequest.getSalary().getVariableAmount()));
        }
        if (payslipRequest.getSalary().getGrossAmount() != null) {
            gross = new String(Base64.getDecoder().decode(payslipRequest.getSalary().getGrossAmount()));
        }

        if (payslipRequest.getSalary().getSalaryConfigurationEntity().getAllowances() != null) {
            Map<String, String> decodedAllowances = new HashMap<>();
            for (Map.Entry<String, String> entry : payslipRequest.getSalary().getSalaryConfigurationEntity().getAllowances().entrySet()) {
                String unMaskValue =  unMaskValue(entry.getValue());
                decodedAllowances.put(entry.getKey(), unMaskValue);
            }
            payslipRequest.getSalary().getSalaryConfigurationEntity().setAllowances(decodedAllowances);

        }

        if (payslipRequest.getSalary().getSalaryConfigurationEntity().getDeductions() != null) {
            Map<String, String> decodedDeductions = new HashMap<>();

            for (Map.Entry<String, String> entry : payslipRequest.getSalary().getSalaryConfigurationEntity().getDeductions().entrySet()) {
                String unMaskValue =  unMaskValue(entry.getValue());
                decodedDeductions.put(entry.getKey(), unMaskValue);
            }
            payslipRequest.getSalary().getSalaryConfigurationEntity().setDeductions(decodedDeductions);

        }
        if (payslipRequest.getAttendance().getNoOfWorkingDays()!= null) {
            noOfWorkingDays = new String(Base64.getDecoder().decode(payslipRequest.getAttendance().getNoOfWorkingDays()));
        }
        if (payslipRequest.getAttendance().getTotalWorkingDays()!= null) {
            totalWorkingDays = new String(Base64.getDecoder().decode(payslipRequest.getAttendance().getTotalWorkingDays()));
        }
        if (payslipRequest.getAttendance().getFirstName()!= null) {
            firstName = new String(Base64.getDecoder().decode(payslipRequest.getAttendance().getFirstName()));
        }
        if (payslipRequest.getAttendance().getLastName()!= null) {
            lastName = new String(Base64.getDecoder().decode(payslipRequest.getAttendance().getLastName()));
        }
        if (payslipRequest.getAttendance().getEmailId()!= null) {
            email = new String(Base64.getDecoder().decode(payslipRequest.getAttendance().getEmailId()));
        }
        if (payslipRequest.getSalary().getIncomeTax() != null) {
            itax = new String(Base64.getDecoder().decode(payslipRequest.getSalary().getIncomeTax()));
        }
        if (payslipRequest.getSalary().getPfTax() != null) {
            tax = new String(Base64.getDecoder().decode(payslipRequest.getSalary().getPfTax()));
        }
        if (payslipRequest.getSalary().getTotalEarnings() != null) {
            te = new String(Base64.getDecoder().decode(payslipRequest.getSalary().getTotalEarnings()));
        }
        if (payslipRequest.getSalary().getTotalTax() != null) {
            ttax = new String(Base64.getDecoder().decode(payslipRequest.getSalary().getTotalTax()));
        }
        if (payslipRequest.getSalary().getTotalDeductions() != null) {
            tded = new String(Base64.getDecoder().decode(payslipRequest.getSalary().getTotalDeductions()));
        }
        if (payslipRequest.getSalary().getNetSalary() != null) {
            net = new String(Base64.getDecoder().decode(payslipRequest.getSalary().getNetSalary()));
        }
        if (payslipRequest.getSalary().getLop() != null) {
            lop = new String(Base64.getDecoder().decode(payslipRequest.getSalary().getLop()));
        }

        payslipRequest.getSalary().setFixedAmount(fix);
        payslipRequest.getSalary().setGrossAmount(gross);
        payslipRequest.getSalary().setVariableAmount(var);
        payslipRequest.getSalary().setTotalEarnings(te);
        payslipRequest.getSalary().setNetSalary(net);
        payslipRequest.getSalary().setTotalTax(ttax);
        payslipRequest.getSalary().setIncomeTax(itax);
        payslipRequest.getSalary().setPfTax(tax);
        payslipRequest.getSalary().setTotalDeductions(tded);
        payslipRequest.getSalary().setLop(lop);

        String inWords =  numberToWords(Double.valueOf(net));
        payslipRequest.setInWords(inWords + " Rupees Only.");
        payslipRequest.getAttendance().setNoOfWorkingDays(noOfWorkingDays);
        payslipRequest.getAttendance().setTotalWorkingDays(totalWorkingDays);
        payslipRequest.getAttendance().setFirstName(firstName);
        payslipRequest.getAttendance().setLastName(lastName);
        payslipRequest.getAttendance().setEmailId(email);
        payslipRequest.getAttendance().setEmailId(email);
        payslipRequest.getAttendance().setEmailId(email);
        payslipRequest.setType(Constants.PAYSLIP);


        return payslipRequest;
    }


    static String[] singleDigit = {"", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"};
    static String[] doubleDigit = {"Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"};
    static String[] belowHundred = {"Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"};

    private static String numberToWords(Double n) {
        double num = n; // Convert Double to double
        if (num < 0) {
            return "Minus " + numberToWords(-num);
        }
        if (num == 0) {
            return "Zero";
        }

        // Recursive function to translate the number into words
        StringBuilder word = new StringBuilder();
        word.append(translate((int) num));

        // Get the result by translating the given number
        return word.toString().trim();
    }

    // Translate method to convert the number into words
    private static String translate(int n) {
        StringBuilder word = new StringBuilder();

        if (n < 10) {
            word.append(singleDigit[n]).append(' ');
        } else if (n < 20) {
            word.append(doubleDigit[n - 10]).append(' ');
        } else if (n < 100) {
            String rem = translate(n % 10);
            word.append(belowHundred[(n - n % 10) / 10 - 2]).append(' ').append(rem);
        } else if (n < 1000) {
            word.append(singleDigit[n / 100]).append(" Hundred ").append(translate(n % 100));
        } else if (n < 100000) {
            // Handling for numbers between 1 Lakh and 10 Lakh
            word.append(translate(n / 1000)).append(" Thousand ").append(translate(n % 1000));
        } else if (n < 10000000) {
            // Lakh handling: For numbers between 1 Lakh and 10 Lakh
            int lakh = n / 100000;
            word.append(translate(lakh)).append(" Lakh ");  // "Lakh" for singular
            word.append(translate(n % 100000));
        } else if (n < 100000000) {
            // Crore handling
            word.append(translate(n / 10000000)).append(" Crore ").append(translate(n % 10000000));
        } else if (n < 1000000000) {
            word.append(translate(n / 100000000)).append(" Hundred ").append(translate(n % 100000000));
        } else {
            word.append(translate(n / 1000000000)).append(" Billion ").append(translate(n % 1000000000));
        }

        return word.toString().trim();
    }


    public static void forFormatNumericalFields(PayslipEntity payslipProperties) {
        if (payslipProperties.getSalary() != null) {
            payslipProperties.getSalary().setFixedAmount(formatValue(payslipProperties.getSalary().getFixedAmount()));
            payslipProperties.getSalary().setNetSalary(formatValue(payslipProperties.getSalary().getNetSalary()));
            payslipProperties.getSalary().setGrossAmount(formatValue(payslipProperties.getSalary().getGrossAmount()));
            payslipProperties.getSalary().setTotalEarnings(formatValue(payslipProperties.getSalary().getTotalEarnings()));
            payslipProperties.getSalary().setVariableAmount(formatValue(payslipProperties.getSalary().getVariableAmount()));
            payslipProperties.getSalary().setTotalDeductions(formatValue(payslipProperties.getSalary().getTotalDeductions()));
            payslipProperties.getSalary().setTotalTax(formatValue(payslipProperties.getSalary().getTotalTax()));
            payslipProperties.getSalary().setLop(formatValue(payslipProperties.getSalary().getLop()));

            if (payslipProperties.getSalary().getSalaryConfigurationEntity().getAllowances() != null) {
                Map<String, String> formatAllowance = new HashMap<>();
                for (Map.Entry<String, String> entry : payslipProperties.getSalary().getSalaryConfigurationEntity().getAllowances().entrySet()) {
                    String formattedValue = formatValue(entry.getValue());
                    formatAllowance.put(entry.getKey(), formattedValue);
                }
                payslipProperties.getSalary().getSalaryConfigurationEntity().setAllowances(formatAllowance);
            }
            if (payslipProperties.getSalary().getSalaryConfigurationEntity().getDeductions() != null) {
                Map<String, String> formatDeductions = new HashMap<>();
                for (Map.Entry<String, String> entry : payslipProperties.getSalary().getSalaryConfigurationEntity().getDeductions().entrySet()) {
                    String formattedValue = formatValue(entry.getValue());
                    formatDeductions.put(entry.getKey(), formattedValue);
                }
                payslipProperties.getSalary().getSalaryConfigurationEntity().setDeductions(formatDeductions);

            }

        }
    }

    private static String formatValue(String value) {
        if (value == null || value.isEmpty()) {
            return value;
        }
        try {
            // Parse the value to integer and then format it
            double doubleValue = Double.parseDouble(value);
            long longValue = (long) doubleValue; // Extract the integer part

            return String.valueOf(longValue);
        } catch (NumberFormatException e) {
            // Handle the exception as needed
            e.printStackTrace();
            return value; // Return original value in case of error
        }
    }
    private static String maskValue(String value) {
        if (value == null || value.isEmpty()) {
            return value; // Return as is if null or empty
        }
        return Base64.getEncoder().encodeToString(value.toString().getBytes()); // Replace with your desired masking pattern
    }


    public static PayslipEntity maskEmployeePayslipUpdateProperties(PayslipUpdateRequest payslipRequest, String payslipId ,String employeeId) {

        String var = null, fix = null, bas = null, gross = null;
        String hra = null, trav = null, pfc = null, other = null, spa = null;
        String te = null, pfE = null, pfEmployer = null, lop = null, tax = null,
                itax = null, ttax = null, tded = null, net = null;
        Map<String, String> allowances = new HashMap<>();
        Map<String, String> deductions = new HashMap<>();


        if (payslipRequest.getSalary().getFixedAmount() != null) {
            fix = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getFixedAmount()).getBytes());
        }
        if (payslipRequest.getSalary().getLop() != null) {
            lop = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getLop()).getBytes());
        }
        if (payslipRequest.getSalary().getVariableAmount() != null) {
            var = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getVariableAmount()).getBytes());
        }
        if (payslipRequest.getSalary().getGrossAmount() != null) { //annual
            gross  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getGrossAmount()).getBytes());
        }
        if (payslipRequest.getSalary().getTotalEarnings() != null) { //annual
            te  =Base64.getEncoder().encodeToString((payslipRequest.getSalary().getTotalEarnings()).getBytes());
        }
        if (payslipRequest.getSalary().getNetSalary() != null) { //annual
            net  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getNetSalary()).getBytes());
        }
        if (payslipRequest.getSalary().getTotalDeductions() != null) { //annual
            tded  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getTotalDeductions()).getBytes());
        }
        if (payslipRequest.getSalary().getIncomeTax() != null) { //annual
            itax  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getIncomeTax()).getBytes());
        }
        if (payslipRequest.getSalary().getPfTax() != null) { //annual
            tax  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getPfTax()).getBytes());
        }
        if (payslipRequest.getSalary().getTotalTax() != null) { //annual
            ttax  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getTotalTax()).getBytes());
        }

        if (payslipRequest.getSalary().getSalaryConfigurationEntity().getAllowances() != null) {
            for (Map.Entry<String, String> entry : payslipRequest.getSalary().getSalaryConfigurationEntity().getAllowances().entrySet()) {
                allowances.put(entry.getKey(), maskValue(entry.getValue()));
            }
        }
        if (payslipRequest.getSalary().getSalaryConfigurationEntity().getDeductions() != null) {
            for (Map.Entry<String, String> entry : payslipRequest.getSalary().getSalaryConfigurationEntity().getDeductions().entrySet()) {
                deductions.put(entry.getKey(), maskValue(entry.getValue()));
            }
        }

        ObjectMapper objectMapper = new ObjectMapper();
        AttendanceEntity attendanceEntity = objectMapper.convertValue(payslipRequest.getAttendance(),AttendanceEntity.class);
        attendanceEntity.setMonth(Base64.getEncoder().encodeToString((attendanceEntity.getMonth()).getBytes()));
        attendanceEntity.setYear(Base64.getEncoder().encodeToString((attendanceEntity.getYear()).getBytes()));
        attendanceEntity.setTotalWorkingDays(Base64.getEncoder().encodeToString((attendanceEntity.getTotalWorkingDays()).getBytes()));
        attendanceEntity.setNoOfWorkingDays(Base64.getEncoder().encodeToString((attendanceEntity.getNoOfWorkingDays()).getBytes()));
        attendanceEntity.setLastName(Base64.getEncoder().encodeToString((attendanceEntity.getLastName()).getBytes()));
        attendanceEntity.setFirstName(Base64.getEncoder().encodeToString((attendanceEntity.getFirstName()).getBytes()));
        attendanceEntity.setEmailId(Base64.getEncoder().encodeToString((attendanceEntity.getEmailId()).getBytes()));

        PayslipEntity payslipEntity = objectMapper.convertValue(payslipRequest, PayslipEntity.class);
        payslipEntity.setPayslipId(payslipId);
        payslipEntity.setEmployeeId(employeeId);
        payslipEntity.setSalaryId(payslipEntity.getSalary().getSalaryId());
        payslipEntity.setAttendanceId(payslipEntity.getAttendance().getAttendanceId());

        EmployeeSalaryEntity salary = objectMapper.convertValue(payslipRequest.getSalary(),EmployeeSalaryEntity.class);
        salary.setFixedAmount(fix);
        salary.setGrossAmount(gross);
        salary.setVariableAmount(var);
        salary.setTotalEarnings(te);
        salary.setNetSalary(net);
        salary.setTotalDeductions(tded);
        salary.setLop(lop);
        salary.setIncomeTax(itax);
        salary.getSalaryConfigurationEntity().setAllowances(allowances);
        salary.getSalaryConfigurationEntity().setDeductions(deductions);
        salary.setPfTax(tax);
        salary.setTotalTax(ttax);
        payslipEntity.setSalary(salary);
        payslipEntity.setAttendance(attendanceEntity);
        payslipEntity.setType(Constants.PAYSLIP);
        return payslipEntity;
    }
    public static Map<String, Map<String, String>> calculateSalaryComponents(SalaryConfigurationEntity salaryConfiguration, String grossAnnualSalary) {
        Map<String, Map<String, String>> components = new LinkedHashMap<>(); // Use LinkedHashMap to maintain order

        Double grossAmount = Double.parseDouble(grossAnnualSalary);
        // Convert annual gross salary to monthly salary for Basic Salary
        Double grossMonthlySalary = grossAmount / 12;

        double totalAllowanceAnnual = 0.0;
        double totalAllowanceMonthly = 0.0;
        double basicSalaryAnnual = 0.0;
        double basicSalaryMonthly = 0.0;

        // **Dynamic Fields Calculation** (Basic Salary, HRA, Provident Fund)
        Map<String, String> dynamicAllowances = salaryConfiguration.getAllowances();  // Assuming dynamic fields are stored in a map

        // Check if Basic Salary is part of the dynamic fields and calculate it
        if (dynamicAllowances.containsKey(Constants.BASIC_SALARY)) {
            String basicSalaryPercentage = dynamicAllowances.get(Constants.BASIC_SALARY);

            // Remove the percentage sign and trim any spaces
            basicSalaryPercentage = basicSalaryPercentage.replace(Constants.PERCENTAGE, "").trim();

            // Convert the percentage to a double and calculate the annual and monthly salary
            double formatBasicSalary = Double.parseDouble(basicSalaryPercentage);
            basicSalaryAnnual = grossAmount * (formatBasicSalary / 100); // Calculate annual Basic Salary
            basicSalaryMonthly = basicSalaryAnnual / 12; // Calculate monthly Basic Salary

            // Add the Basic Salary to components
            Map<String, String> basicSalaryData = new HashMap<>();
            basicSalaryData.put(Constants.MONTH, formatValue(String.valueOf(basicSalaryMonthly)));
            basicSalaryData.put(Constants.ANNUAL, formatValue(String.valueOf(basicSalaryAnnual)));
            components.put(Constants.BASIC_SALARY , basicSalaryData);

            // Accumulate total allowances
            totalAllowanceAnnual += basicSalaryAnnual;
            totalAllowanceMonthly += basicSalaryMonthly;
        }

        // Check if HRA is part of the dynamic fields and calculate it
        if (dynamicAllowances.containsKey(Constants.HRA)) {
            String hraPercentageString = dynamicAllowances.get(Constants.HRA);

            // Remove the percentage sign and trim any spaces
            hraPercentageString = hraPercentageString.replace(Constants.PERCENTAGE, "").trim();

            // Convert the percentage to a double and calculate the annual and monthly HRA
            double hraPercentage = Double.parseDouble(hraPercentageString);
            double hraAnnual = basicSalaryAnnual * (hraPercentage / 100);  // Calculate annual HRA from Basic Salary
            double hraMonthly = hraAnnual / 12;  // Calculate monthly HRA

            // Add the HRA to components
            Map<String, String> hraData = new HashMap<>();
            hraData.put(Constants.MONTH, formatValue(String.valueOf(hraMonthly)));
            hraData.put(Constants.ANNUAL, formatValue(String.valueOf(hraAnnual)));
            components.put(Constants.HRA , hraData);

            // Accumulate total allowances
            totalAllowanceAnnual += hraAnnual;
            totalAllowanceMonthly += hraMonthly;
        }

        // **Other Allowances Calculation** (not Basic Salary or HRA)
        Map<String, String> allowances = salaryConfiguration.getAllowances();
        if (allowances != null) {
            for (Map.Entry<String, String> entry : allowances.entrySet()) {
                // Skip Basic Salary and HRA, they have already been processed
                if (!Constants.BASIC_SALARY.equals(entry.getKey()) && !Constants.HRA.equals(entry.getKey())) {
                    // Calculate allowance values
                    double allowanceAnnualValue = Double.parseDouble(persentageOrValueForYearly(entry.getValue(), grossAmount));
                    double allowanceMonthlyValue = allowanceAnnualValue / 12;

                    // Add the formatted allowance to components
                    Map<String, String> allowanceData = new HashMap<>();
                    allowanceData.put(Constants.MONTH, formatValue(String.valueOf(allowanceMonthlyValue)));
                    allowanceData.put(Constants.ANNUAL, formatValue(String.valueOf(allowanceAnnualValue)));
                    components.put(formatComponentName(entry.getKey()), allowanceData);

                    // Accumulate total allowances
                    totalAllowanceAnnual += allowanceAnnualValue;
                    totalAllowanceMonthly += allowanceMonthlyValue;
                }
            }
        }

        // **Other Allowance** (Gross CTC - Total Allowances - Deductions)
        double otherAllowanceAnnual = Math.round(grossAmount - totalAllowanceAnnual);
        double otherAllowanceMonthly = Math.round(otherAllowanceAnnual / 12);

        if (otherAllowanceAnnual > 0) {
            Map<String, String> otherAllowanceData = new HashMap<>();
            otherAllowanceData.put(Constants.MONTH, formatValue(String.valueOf(otherAllowanceMonthly)));
            otherAllowanceData.put(Constants.ANNUAL, formatValue(String.valueOf(otherAllowanceAnnual)));
            components.put(Constants.OTHER_ALLOWANCES, otherAllowanceData);
        }

        // **Gross CTC** (directly using the provided grossAnnualSalary)
        Map<String, String> grossSalaryData = new HashMap<>();
        grossSalaryData.put(Constants.MONTH, "<b>" + formatValue(String.valueOf(grossMonthlySalary)) + "</b>");
        grossSalaryData.put(Constants.ANNUAL, "<b>" + formatValue(String.valueOf(grossAmount)) + "</b>");
        components.put("<b>" + Constants.GROSS_CTC + "</b>", grossSalaryData);

        // **Provident Fund (Employee and Employer) Calculations** from Basic Salary
        Map<String, String> dynamicDeductions = salaryConfiguration.getDeductions();  // Assuming dynamic fields are stored in a map

        // **Deductions Calculation**
        double totalDedMonthlySalary = 0.0;
        double totalDedAnnualSalary = 0.0;
        // Check if Provident Fund (Employee) is part of the dynamic fields and calculate it
        if (dynamicDeductions.containsKey(Constants.PF_EMPLOYEE)) {
            String pfEmployeePercentageString = dynamicDeductions.get(Constants.PF_EMPLOYEE);

            // Remove the percentage sign and trim any spaces
            pfEmployeePercentageString = pfEmployeePercentageString.replace(Constants.PERCENTAGE, "").trim();

            // Convert the percentage to a double and calculate the annual and monthly Provident Fund Employee
            double pfEmployeePercentage = Double.parseDouble(pfEmployeePercentageString);
            double pfEmployeeAnnual = Math.round(basicSalaryAnnual * (pfEmployeePercentage / 100));  // Calculate annual PF Employee from Basic Salary
            double pfEmployeeMonthly = Math.round(pfEmployeeAnnual / 12); // Calculate monthly PF Employee

            // Add the Provident Fund Employee contribution to components
            Map<String, String> pfEmployeeData = new HashMap<>();
            pfEmployeeData.put(Constants.MONTH, formatValue(String.valueOf(pfEmployeeMonthly)));
            pfEmployeeData.put(Constants.ANNUAL, formatValue(String.valueOf(pfEmployeeAnnual)));
            components.put(Constants.PF_EMPLOYEE, pfEmployeeData);

            totalDedMonthlySalary += pfEmployeeMonthly;
            totalDedAnnualSalary += pfEmployeeAnnual;
        }

        // Check if Provident Fund (Employer) is part of the dynamic fields and calculate it
        if (dynamicDeductions.containsKey(Constants.PF_EMPLOYER)) {
            String pfEmployerPercentageString = dynamicDeductions.get(Constants.PF_EMPLOYER);

            // Remove the percentage sign and trim any spaces
            pfEmployerPercentageString = pfEmployerPercentageString.replace(Constants.PERCENTAGE, "").trim();

            // Convert the percentage to a double and calculate the annual and monthly Provident Fund Employer
            double pfEmployerPercentage = Double.parseDouble(pfEmployerPercentageString);
            double pfEmployerAnnual = Math.round(basicSalaryAnnual * (pfEmployerPercentage / 100));  // Calculate annual PF Employer from Basic Salary
            double pfEmployerMonthly = Math.round(pfEmployerAnnual / 12); // Calculate monthly PF Employer

            // Add the Provident Fund Employer contribution to components
            Map<String, String> pfEmployerData = new HashMap<>();
            pfEmployerData.put(Constants.MONTH, formatValue(String.valueOf(pfEmployerMonthly)));
            pfEmployerData.put(Constants.ANNUAL, formatValue(String.valueOf(pfEmployerAnnual)));
            components.put(Constants.PF_EMPLOYER, pfEmployerData);

            totalDedMonthlySalary += pfEmployerMonthly;
            totalDedAnnualSalary += pfEmployerAnnual;
        }

        // Calculate deductions without affecting Gross Salary
        Map<String, String> deductions = salaryConfiguration.getDeductions();
        if (deductions != null) {
            for (Map.Entry<String, String> entry : deductions.entrySet()) {
                // Skip PF Employee and PF Employer, they have already been processed
                if (!Constants.PF_EMPLOYEE.equals(entry.getKey()) && !Constants.PF_EMPLOYER.equals(entry.getKey())) {
                    double deductionAnnualValue = Double.parseDouble(persentageOrValueForYearly(entry.getValue(), grossAmount));
                    double deductionMonthlyValue = deductionAnnualValue / 12;

                    // Add formatted deduction to components only
                    Map<String, String> deductionData = new HashMap<>();
                    String formatMonthlyValue = formatValue(String.valueOf(deductionMonthlyValue));
                    String formatYearlyValue = formatValue(String.valueOf(deductionAnnualValue));
                    deductionData.put(Constants.MONTH, formatMonthlyValue);
                    deductionData.put(Constants.ANNUAL, formatYearlyValue);
                    components.put(formatComponentName(entry.getKey()), deductionData);

                    totalDedMonthlySalary += Double.parseDouble(formatMonthlyValue);
                    totalDedAnnualSalary += Double.parseDouble(formatYearlyValue);
                }
            }
        }

        // **Total Deductions** (from monthly and annual totals)
        Map<String, String> grossSalaryCtcData = new HashMap<>();
        grossSalaryCtcData.put(Constants.MONTH, "<b>" + formatValue(String.valueOf(totalDedMonthlySalary)) + "</b>");
        grossSalaryCtcData.put(Constants.ANNUAL, "<b>" + formatValue(String.valueOf(totalDedAnnualSalary)) + "</b>");
        components.put("<b>" + Constants.TOTAL_DEDUCTIONS + "</b>", grossSalaryCtcData);

        // **Net Salary** after deductions
        Map<String, String> netSalary = new HashMap<>();
        netSalary.put(Constants.MONTH, "<b>" + formatValue(String.valueOf(grossMonthlySalary - totalDedMonthlySalary)) + "</b>");
        netSalary.put(Constants.ANNUAL, "<b>" + formatValue(String.valueOf(grossAmount - totalDedAnnualSalary)) + "</b>");
        components.put("<b>" + Constants.NET_SALARY + "</b>", netSalary);

        return components;
    }

    public static Map<String, Map<String, String>> calculateSalaryYearlyComponents(SalaryConfigurationEntity salaryConfiguration, String grossAnnualSalary) {
        Map<String, Map<String, String>> components = new LinkedHashMap<>(); // Use LinkedHashMap to maintain order

        Double grossAmount = Double.parseDouble(grossAnnualSalary);
        double totalAllowanceAnnual = 0.0;
        double basicSalaryAnnual = 0.0;

        // **Dynamic Fields Calculation** (Basic Salary, HRA, Provident Fund)
        Map<String, String> dynamicAllowances = salaryConfiguration.getAllowances();  // Assuming dynamic fields are stored in a map

        // Check if Basic Salary is part of the dynamic fields and calculate it
        if (dynamicAllowances.containsKey(Constants.BASIC_SALARY)) {
            String basicSalaryPercentage = dynamicAllowances.get(Constants.BASIC_SALARY);

            // Remove the percentage sign and trim any spaces
            basicSalaryPercentage = basicSalaryPercentage.replace(Constants.PERCENTAGE, "").trim();

            // Convert the percentage to a double and calculate the annual and monthly salary
            double formatBasicSalary = Double.parseDouble(basicSalaryPercentage);
            basicSalaryAnnual = grossAmount * (formatBasicSalary / 100); // Calculate annual Basic Salary

            // Add the Basic Salary to components
            Map<String, String> basicSalaryData = new HashMap<>();
            basicSalaryData.put(Constants.ANNUAL, formatValue(String.valueOf(basicSalaryAnnual)));
            components.put(Constants.BASIC_SALARY , basicSalaryData);

            // Accumulate total allowances
            totalAllowanceAnnual += basicSalaryAnnual;
        }

        // Check if HRA is part of the dynamic fields and calculate it
        if (dynamicAllowances.containsKey(Constants.HRA)) {
            String hraPercentageString = dynamicAllowances.get(Constants.HRA);

            // Remove the percentage sign and trim any spaces
            hraPercentageString = hraPercentageString.replace(Constants.PERCENTAGE, "").trim();

            // Convert the percentage to a double and calculate the annual and monthly HRA
            double hraPercentage = Double.parseDouble(hraPercentageString);
            double hraAnnual = basicSalaryAnnual * (hraPercentage / 100);  // Calculate annual HRA from Basic Salary

            // Add the HRA to components
            Map<String, String> hraData = new HashMap<>();
            hraData.put(Constants.ANNUAL, formatValue(String.valueOf(hraAnnual)));
            components.put(Constants.HRA , hraData);

            // Accumulate total allowances
            totalAllowanceAnnual += hraAnnual;
        }

        // **Other Allowances Calculation** (not Basic Salary or HRA)
        Map<String, String> allowances = salaryConfiguration.getAllowances();
        if (allowances != null) {
            for (Map.Entry<String, String> entry : allowances.entrySet()) {
                // Skip Basic Salary and HRA, they have already been processed
                if (!Constants.BASIC_SALARY.equals(entry.getKey()) && !Constants.HRA.equals(entry.getKey())) {
                    // Calculate allowance values
                    double allowanceAnnualValue = Double.parseDouble(persentageOrValueForYearly(entry.getValue(), grossAmount));

                    // Add the formatted allowance to components
                    Map<String, String> allowanceData = new HashMap<>();
                    allowanceData.put(Constants.ANNUAL, formatValue(String.valueOf(allowanceAnnualValue)));
                    components.put(formatComponentName(entry.getKey()), allowanceData);

                    // Accumulate total allowances
                    totalAllowanceAnnual += allowanceAnnualValue;
                }
            }
        }
        // **Other Allowance** (Gross CTC - Total Allowances - Deductions)
        double otherAllowanceAnnual = grossAmount - totalAllowanceAnnual;

        if (otherAllowanceAnnual > 0) {
            Map<String, String> otherAllowanceData = new HashMap<>();
            otherAllowanceData.put(Constants.ANNUAL, formatValue(String.valueOf(otherAllowanceAnnual)));
            components.put(Constants.OTHER_ALLOWANCES, otherAllowanceData);
        }

        return components;
    }

    private static String formatComponentName(String componentName) {
        if (componentName == null || componentName.isEmpty()) {
            return componentName; // Return the original name if it's null or empty
        }

        // Special case for "hra" to format it as "HRA"
        if (componentName.equalsIgnoreCase(Constants.HRA_SMALL)) {
            return Constants.HRA;
        }

        // General case: Convert camel case to a space-separated format
        String spacedName = componentName.replaceAll("([a-z])([A-Z])", "$1 $2"); // Add space before capital letters
        spacedName = spacedName.replaceAll("([A-Z]+)([A-Z][a-z])", "$1 $2"); // Handle consecutive uppercase letters

        // Capitalize each word in the formatted string
        String[] words = spacedName.split(" ");
        StringBuilder formattedName = new StringBuilder();
        for (String word : words) {
            if (formattedName.length() > 0) {
                formattedName.append(" "); // Add space before subsequent words
            }
            formattedName.append(word.substring(0, 1).toUpperCase()); // Capitalize the first letter
            formattedName.append(word.substring(1).toLowerCase()); // Lowercase the rest
        }

        return formattedName.toString();
    }

}