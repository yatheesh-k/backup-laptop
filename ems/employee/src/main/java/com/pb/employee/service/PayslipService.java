package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.PayslipRequest;
import com.pb.employee.request.PayslipUpdateRequest;
import com.pb.employee.request.SalaryRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;

public interface PayslipService {

    ResponseEntity<?> generatePaySlip(PayslipRequest payslipRequest, String salaryId, String employeeId) throws EmployeeException, IOException;

    ResponseEntity<?> generatePaySlipForAllEmployees(PayslipRequest payslipRequest) throws EmployeeException, IOException;

    ResponseEntity<?> getPayslipById(String companyName, String employeeId , String payslipId) throws EmployeeException, IOException;
    ResponseEntity<?> getEmployeePayslips(String companyName, String employeeId,String month,String year) throws EmployeeException;

    ResponseEntity<?> deleteEmployeePayslipById(String companyName, String employeeId,String payslipId) throws EmployeeException;
    ResponseEntity<?> getAllEmployeesPayslips(String companyName, String month, String year)throws EmployeeException;
    ResponseEntity<byte[]> downloadPayslip(String companyName, String payslipId, String employeeId, HttpServletRequest request);

    ResponseEntity<?> generatePaySlipForEmployees(String salaryId ,PayslipRequest payslipRequest) throws EmployeeException, IOException;

    ResponseEntity<?> savePayslip(PayslipUpdateRequest payslipsRequest, String payslipId, String employeeId) throws EmployeeException, IOException;

}
