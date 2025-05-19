package com.pb.employee.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.util.*;
import java.util.List;

@Slf4j
@Component
public class CompanyUtils {

    public static Entity maskCompanyProperties(CompanyRequest companyRequest, String id, String defaultPassword) {
        String password = Base64.getEncoder().encodeToString(defaultPassword.toString().getBytes());
        String hra = null, pan = null, pf = null, spa = null, ta = null, regNo = null, mobileNo=null, landNo= null, gstNo=null, cinNo=null, pmNo=null, psmailId=null;
        ObjectMapper objectMapper = new ObjectMapper();

        CompanyEntity entity = objectMapper.convertValue(companyRequest, CompanyEntity.class);
        if(companyRequest.getHraPercentage() != null) {
            hra = Base64.getEncoder().encodeToString(companyRequest.getHraPercentage().toString().getBytes());
            entity.setHraPercentage(hra);

        }
        if(companyRequest.getPanNo() != null) {
            pan = Base64.getEncoder().encodeToString(companyRequest.getPanNo().getBytes());
            entity.setPanNo(pan);
        }
        if(companyRequest.getPfPercentage() != null) {
            pf = Base64.getEncoder().encodeToString(companyRequest.getPfPercentage().toString().getBytes());
            entity.setPfPercentage(pf);
        }
        if(companyRequest.getSpecialAllowance() != null) {
            spa = Base64.getEncoder().encodeToString(companyRequest.getSpecialAllowance().toString().getBytes());
            entity.setSpecialAllowance(spa);
        }
        if(companyRequest.getTravelAllowance() != null) {
            ta = Base64.getEncoder().encodeToString(companyRequest.getTravelAllowance().toString().getBytes());
            entity.setTravelAllowance(ta);
        }
        if(companyRequest.getCompanyRegNo() != null) {
            regNo = Base64.getEncoder().encodeToString(companyRequest.getCompanyRegNo().toString().getBytes());
            entity.setCompanyRegNo(regNo);
        }
        if(companyRequest.getMobileNo() != null) {
            mobileNo = Base64.getEncoder().encodeToString(companyRequest.getMobileNo().toString().getBytes());
            entity.setMobileNo(mobileNo);
        }
        if(companyRequest.getAlternateNo() != null) {
            landNo = Base64.getEncoder().encodeToString(companyRequest.getAlternateNo().toString().getBytes());
            entity.setAlternateNo(landNo);
        }
        if(companyRequest.getPersonalMobileNo() != null) {
            pmNo = Base64.getEncoder().encodeToString(companyRequest.getPersonalMobileNo().toString().getBytes());
            entity.setPersonalMobileNo(pmNo);
        }
        if(companyRequest.getPersonalMailId() != null) {
            psmailId = Base64.getEncoder().encodeToString(companyRequest.getPersonalMailId().toString().getBytes());
            entity.setPersonalMailId(psmailId);
        }
        if(companyRequest.getGstNo() != null) {
            gstNo = Base64.getEncoder().encodeToString(companyRequest.getGstNo().toString().getBytes());
            entity.setGstNo(gstNo);
        }
        if(companyRequest.getCinNo() != null) {
            cinNo = Base64.getEncoder().encodeToString(companyRequest.getCinNo().toString().getBytes());
            entity.setCinNo(cinNo);
        }

        entity.setId(id);
        entity.setPassword(password);
        entity.setType(Constants.COMPANY);
        return entity;
    }

    public static Entity unmaskCompanyProperties(CompanyEntity companyEntity,  HttpServletRequest request) {
        String hra = null, pan = null, pf = null, spa = null, ta = null, regNo = null, mobileNo=null, landNo= null, gstNo=null, cinNo=null, personalMobileNumber=null, psmailId=null;
        if(companyEntity.getHraPercentage() != null) {
            hra = new String(Base64.getDecoder().decode(companyEntity.getHraPercentage().getBytes()));
            companyEntity.setHraPercentage(hra);
        }
        if(companyEntity.getPanNo() != null) {
            pan = new String(Base64.getDecoder().decode(companyEntity.getPanNo().getBytes()));
            companyEntity.setPanNo(pan);
        }
        if(companyEntity.getPfPercentage() != null) {
            pf = new String(Base64.getDecoder().decode(companyEntity.getPfPercentage().getBytes()));
            companyEntity.setPfPercentage(pf);

        }
        if(companyEntity.getSpecialAllowance() != null) {
            spa = new String(Base64.getDecoder().decode(companyEntity.getSpecialAllowance().getBytes()));
            companyEntity.setSpecialAllowance(spa);
        }
        if(companyEntity.getTravelAllowance() != null) {
            ta = new String(Base64.getDecoder().decode(companyEntity.getTravelAllowance().getBytes()));
            companyEntity.setTravelAllowance(ta);
        }
        if(companyEntity.getCompanyRegNo() != null) {
            regNo = new String(Base64.getDecoder().decode(companyEntity.getCompanyRegNo().getBytes()));
            companyEntity.setCompanyRegNo(regNo);
        }
        if(companyEntity.getMobileNo() != null) {
            mobileNo = new String(Base64.getDecoder().decode(companyEntity.getMobileNo().getBytes()));
            companyEntity.setMobileNo(mobileNo);
        }
        if(companyEntity.getAlternateNo() != null) {
            landNo = new String(Base64.getDecoder().decode(companyEntity.getAlternateNo().getBytes()));
            companyEntity.setAlternateNo(landNo);
        }
        if(companyEntity.getPersonalMobileNo() != null) {
            personalMobileNumber = new String(Base64.getDecoder().decode(companyEntity.getPersonalMobileNo().getBytes()));
            companyEntity.setPersonalMobileNo(personalMobileNumber);
        }
        if(companyEntity.getPersonalMailId() != null) {
            psmailId = new String(Base64.getDecoder().decode(companyEntity.getPersonalMailId().getBytes()));
            companyEntity.setPersonalMailId(psmailId);
        }
        if(companyEntity.getGstNo() != null) {
            gstNo = new String(Base64.getDecoder().decode(companyEntity.getGstNo().getBytes()));
            companyEntity.setGstNo(gstNo);
        }
        if(companyEntity.getCinNo() != null) {
            cinNo = new String(Base64.getDecoder().decode(companyEntity.getCinNo().getBytes()));
            companyEntity.setCinNo(cinNo);
        }
        if (companyEntity.getImageFile() != null){
            String baseUrl = getBaseUrl(request);
            String image = baseUrl + "var/www/ems/assets/img/" + companyEntity.getImageFile();
            companyEntity.setImageFile(image);
        }
        if (companyEntity.getStampImage() != null){
            String baseUrl = getBaseUrl(request);
            String image = baseUrl + "var/www/ems/assets/img/" + companyEntity.getStampImage();
            companyEntity.setStampImage(image);
        }
        companyEntity.setPassword("**********");
        companyEntity.setType(Constants.COMPANY);
        return companyEntity;
    }

    public static CompanyEntity maskCompanyUpdateProperties(CompanyEntity existingEntity, CompanyUpdateRequest companyRequest) {

        String hra = null, pf = null, spa = null, ta = null, mobileNo=null, landNo=null, pmNo=null, persMailId=null;

        if(companyRequest.getHraPercentage() != null) {
            hra = Base64.getEncoder().encodeToString(companyRequest.getHraPercentage().toString().getBytes());
        }
        if(companyRequest.getPfPercentage() != null) {
            pf = Base64.getEncoder().encodeToString(companyRequest.getPfPercentage().toString().getBytes());
        }
        if(companyRequest.getSpecialAllowance() != null) {
            spa = Base64.getEncoder().encodeToString(companyRequest.getSpecialAllowance().toString().getBytes());
        }
        if(companyRequest.getTravelAllowance() != null) {
            ta = Base64.getEncoder().encodeToString(companyRequest.getTravelAllowance().toString().getBytes());
        }
        // Set common fields
        if(companyRequest.getCompanyAddress() != null) {
            existingEntity.setCompanyAddress(companyRequest.getCompanyAddress());
        }
        if(companyRequest.getMobileNo() != null) {
            mobileNo = Base64.getEncoder().encodeToString(companyRequest.getMobileNo().toString().getBytes());
            existingEntity.setMobileNo(mobileNo);
        }
        if(companyRequest.getAlternateNo() != null) {
            landNo = Base64.getEncoder().encodeToString(companyRequest.getAlternateNo().toString().getBytes());
            existingEntity.setAlternateNo(landNo);
        }if(companyRequest.getPersonalMobileNo() != null) {
            String pesMobileNumber = Base64.getEncoder().encodeToString(companyRequest.getPersonalMobileNo().toString().getBytes());
            existingEntity.setPersonalMobileNo(pesMobileNumber);
        }
        if(companyRequest.getPersonalMailId() != null) {
           String personalMailId = Base64.getEncoder().encodeToString(companyRequest.getPersonalMailId().toString().getBytes());
            existingEntity.setPersonalMailId(personalMailId);
        }
        if(companyRequest.getName() != null) {
            existingEntity.setName(companyRequest.getName());
        }
        if(companyRequest.getAddress() != null) {
            existingEntity.setAddress(companyRequest.getAddress());
        }
        if(companyRequest.getCompanyType() != null) {
            existingEntity.setCompanyType(companyRequest.getCompanyType());
        }
        if(companyRequest.getCompanyBranch() != null) {
            existingEntity.setCompanyBranch(companyRequest.getCompanyBranch());
        }
        if(pf != null) {
            existingEntity.setPfPercentage(pf);
        }
        if(spa != null) {
            existingEntity.setSpecialAllowance(spa);
        }
        if(ta != null) {
            existingEntity.setTravelAllowance(ta);
        }
        if(hra != null) {
            existingEntity.setHraPercentage(hra);
        }
        existingEntity.setType(Constants.COMPANY);
        return existingEntity;
    }
    public static CompanyEntity maskCompanyImageUpdateProperties(CompanyEntity existingEntity, CompanyImageUpdate companyRequest, String id) {
        if(companyRequest.getImage() != null){
            existingEntity.setImageFile(companyRequest.getImage());
        }

        return existingEntity;
    }
    public static CompanyEntity maskCompanyStampImageUpdateProperties(CompanyEntity existingEntity, CompanyStampUpdate companyRequest) {
        if(companyRequest.getImage() != null){
            existingEntity.setStampImage(companyRequest.getImage());
        }

        return existingEntity;
    }


    public static Entity maskEmployeeProperties(EmployeeRequest employeeRequest, String id, String companyId,String defaultPassword) {
        String password = Base64.getEncoder().encodeToString(defaultPassword.getBytes());
        String hra = null, pan = null, pf = null, spa = null, ta = null;
        ObjectMapper objectMapper = new ObjectMapper();

        EmployeeEntity entity = objectMapper.convertValue(employeeRequest, EmployeeEntity.class);
        if(employeeRequest.getPanNo() != null) {
            pan = Base64.getEncoder().encodeToString(employeeRequest.getPanNo().getBytes());
            entity.setPanNo(pan);
        }

        entity.setId(id);
        entity.setPassword(password);
        entity.setCompanyId(companyId);
        entity.setType(Constants.EMPLOYEE);
        return entity;
    }


    public static Entity maskEmployeeUpdateProperties(EmployeeEntity user, EmployeeUpdateRequest employeeUpdateRequest) {

        String accountNo=null,ifscCode=null, mobileNo=null;
        if (employeeUpdateRequest.getEmployeeType() != null){
            user.setEmployeeType(employeeUpdateRequest.getEmployeeType());
        }
        if (employeeUpdateRequest.getDesignation() != null){
            user.setDesignation(employeeUpdateRequest.getDesignation());
        }
        if (employeeUpdateRequest.getDepartment() != null){
            user.setDepartment(employeeUpdateRequest.getDepartment());
        }
        if (employeeUpdateRequest.getManager() != null){
            user.setManager(employeeUpdateRequest.getManager());
        }
//        if (employeeUpdateRequest.getRoles() != null){
//            user.setRoles(Collections.singletonList(String.valueOf(employeeUpdateRequest.getRoles())));
//        }
        if (employeeUpdateRequest.getLocation() != null){
            user.setLocation(employeeUpdateRequest.getLocation());
        }
        if (employeeUpdateRequest.getBankName() != null){
            user.setBankName(employeeUpdateRequest.getBankName());
        }
        if (employeeUpdateRequest.getAccountNo() != null) {
            accountNo = Base64.getEncoder().encodeToString(employeeUpdateRequest.getAccountNo().getBytes());
            user.setAccountNo(accountNo);
        }
        if (employeeUpdateRequest.getMobileNo() != null) {
            mobileNo = Base64.getEncoder().encodeToString(employeeUpdateRequest.getMobileNo().getBytes());
            user.setMobileNo(mobileNo);
        }

        if (employeeUpdateRequest.getIfscCode() != null) {
            ifscCode = Base64.getEncoder().encodeToString(employeeUpdateRequest.getIfscCode().getBytes());
            user.setIfscCode(ifscCode);
        }
        if (employeeUpdateRequest.getStatus() != null){
            user.setStatus(employeeUpdateRequest.getStatus());
        }

        return user;
    }


    public static Entity maskUpdateSalary(SalaryUpdateRequest salaryRequest, EmployeeSalaryEntity salary) {

        String var = null, fix = null, gross = null;
        String te= null, pfTax = null, ttax = null, tded = null, net = null, itax=null;

        if(salaryRequest.getFixedAmount() != null) {
            fix = (Base64.getEncoder().encodeToString(salaryRequest.getFixedAmount().toString().getBytes()));
            salary.setFixedAmount(fix);
        }
        if(salaryRequest.getVariableAmount() != null) {
            var = Base64.getEncoder().encodeToString(salaryRequest.getVariableAmount().toString().getBytes());
            salary.setVariableAmount(var);
        }
        if (salaryRequest.getGrossAmount() != null) {
            pfTax  = String.valueOf(TaxCalculatorUtils.getPfTax(Double.parseDouble(salaryRequest.getGrossAmount())));
            gross= (Base64.getEncoder().encodeToString(salaryRequest.getGrossAmount().toString().getBytes()));
            salary.setGrossAmount(gross);
        }
        double totalAllowance = 0.0;
        if (salaryRequest.getSalaryConfigurationRequest().getAllowances()!=null){
            Map<String, String> allowance = new HashMap<>();
            for (Map.Entry<String, String> entry : salaryRequest.getSalaryConfigurationRequest().getAllowances().entrySet()){
                String encodedValue = Base64.getEncoder().encodeToString(entry.getValue().getBytes());
                allowance.put(entry.getKey(), encodedValue);
            }
            salary.getSalaryConfigurationEntity().setAllowances(allowance);

        }
        double totalDeduction = 0.0;
        if (salaryRequest.getSalaryConfigurationRequest().getDeductions()!=null){
            Map<String, String> deductions = new HashMap<>();
            for (Map.Entry<String, String> entry : salaryRequest.getSalaryConfigurationRequest().getDeductions().entrySet()){
                String encodedValue = Base64.getEncoder().encodeToString(entry.getValue().getBytes());
                deductions.put(entry.getKey(), encodedValue);
            }
            salary.getSalaryConfigurationEntity().setDeductions(deductions);

        }
        if (salaryRequest.getNetSalary()!= null){
            net=Base64.getEncoder().encodeToString(salaryRequest.getNetSalary().getBytes());
            salary.setNetSalary(net);
        }
        if (salaryRequest.getIncomeTax()!= null){
            double tax= Double.parseDouble(pfTax) + Double.parseDouble(salaryRequest.getIncomeTax());
            itax=Base64.getEncoder().encodeToString(salaryRequest.getIncomeTax().getBytes());
            pfTax = Base64.getEncoder().encodeToString(pfTax.getBytes());
             String taxes = Base64.getEncoder().encodeToString(String.valueOf(tax).getBytes());
            salary.setIncomeTax(itax);
            salary.setPfTax(pfTax);
            salary.setTotalTax(taxes);

        }

        if (salaryRequest.getTotalEarnings()!= null){
            te=Base64.getEncoder().encodeToString(salaryRequest.getTotalEarnings().getBytes());
            salary.setTotalEarnings(te);
        }
        if (salaryRequest.getTotalDeductions() !=null){
            tded= Base64.getEncoder().encodeToString(salaryRequest.getTotalDeductions().getBytes());
            salary.setTotalDeductions(tded);
        }

        if (salaryRequest.getStatus() !=null){
            salary.setStatus(salaryRequest.getStatus());
        }


        salary.setType(Constants.SALARY);
        return salary;
    }

    public static Entity maskAttendanceProperties(AttendanceRequest attendanceRequest, String attendanceId, String employeeId) {
        String totalWd = null, noOfWd = null,fn=null,email=null,ln=null;
        ObjectMapper objectMapper = new ObjectMapper();

        AttendanceEntity entity = objectMapper.convertValue(attendanceRequest, AttendanceEntity.class);

        if(attendanceRequest.getTotalWorkingDays() != null) {
            totalWd = (Base64.getEncoder().encodeToString(attendanceRequest.getTotalWorkingDays().getBytes()));
            entity.setTotalWorkingDays(totalWd);

        }if(attendanceRequest.getNoOfWorkingDays()!= null) {
            noOfWd = (Base64.getEncoder().encodeToString(attendanceRequest.getNoOfWorkingDays().getBytes()));
            entity.setNoOfWorkingDays(noOfWd);
        }
        if(attendanceRequest.getEmailId()!= null) {
            email = (Base64.getEncoder().encodeToString(attendanceRequest.getEmailId().getBytes()));
            entity.setEmailId(email);
        }
        if(attendanceRequest.getFirstName()!= null) {
            fn = (Base64.getEncoder().encodeToString(attendanceRequest.getFirstName().getBytes()));
            entity.setFirstName(fn);
        }
        if(attendanceRequest.getLastName()!= null) {
            ln = (Base64.getEncoder().encodeToString(attendanceRequest.getLastName().getBytes()));
            entity.setLastName(ln);
        }
        entity.setEmployeeId(employeeId);
        entity.setAttendanceId(attendanceId);
        entity.setType(Constants.ATTENDANCE);

        return entity;
    }
    public static Entity maskAttendanceUpdateProperties(AttendanceUpdateRequest attendanceRequest, AttendanceEntity attendance) {
        String totalWd = null, noOfWd = null;

        if(attendanceRequest.getNoOfWorkingDays()!= null) {
            noOfWd = (Base64.getEncoder().encodeToString(attendanceRequest.getNoOfWorkingDays().getBytes()));
            attendance.setNoOfWorkingDays(noOfWd);

        }
        return attendance;
    }
    public static Entity unMaskAttendanceProperties(AttendanceEntity entity){
        String totalWd = null, noOfWd = null,email=null,fn=null,ln=null;

        if(entity.getTotalWorkingDays() != null) {
            totalWd = new String(Base64.getDecoder().decode(entity.getTotalWorkingDays()));
        }if(entity.getNoOfWorkingDays()!= null) {
            noOfWd = new String(Base64.getDecoder().decode(entity.getNoOfWorkingDays()));
        }
        if(entity.getEmailId()!= null) {
            email = new String(Base64.getDecoder().decode(entity.getEmailId()));
        }
        if(entity.getFirstName()!= null) {
            fn = new String(Base64.getDecoder().decode(entity.getFirstName()));
        }
        if(entity.getLastName()!= null) {
            ln = new String(Base64.getDecoder().decode(entity.getLastName()));
        }
        entity.setTotalWorkingDays(totalWd);
        entity.setNoOfWorkingDays(noOfWd);
        entity.setEmailId(email);
        entity.setFirstName(fn);
        entity.setLastName(ln);
        entity.setType(Constants.ATTENDANCE);

        return entity;
    }

    public static Map<String, Object> duplicateValues(CompanyRequest companyRequest, List<CompanyEntity> companyEntities) {
        Map<String, Object> responseBody = new HashMap<>();
           String cinNo = null, regNo = null, mobileNo = null, landNo =  null,
                   panNo= null, personalMail = null, personalMobile = null,
                   mailId=null;
        for (CompanyEntity companyEntity :companyEntities) {

            if (companyRequest.getEmailId() != null && companyEntity.getEmailId() != null) {
                if (companyEntity.getEmailId().equals(companyRequest.getEmailId())){
                    responseBody.put(Constants.DUPLICATE_EMAIL_ID, companyRequest.getEmailId());
                }

            }
            if (companyEntity.getCompanyRegNo() != null && companyRequest.getCompanyRegNo() != null && !companyEntity.getCompanyRegNo().isEmpty()) {
                regNo = new String(Base64.getDecoder().decode(companyEntity.getCompanyRegNo().getBytes()));
                if (regNo.equals(companyRequest.getCompanyRegNo())){
                    responseBody.put(Constants.DUPLICATE_REGISTER_NO, companyRequest.getCompanyRegNo());
                }

            }
            if (companyRequest.getMobileNo() != null && companyEntity.getMobileNo() != null) {
                mobileNo = new String(Base64.getDecoder().decode(companyEntity.getMobileNo().getBytes()));
                if (mobileNo.equals(companyRequest.getMobileNo())){
                    responseBody.put(Constants.DUPLICATE_MOBILE_NO, companyRequest.getMobileNo());
                }

            }
            if (companyRequest.getAlternateNo() != null && companyEntity.getAlternateNo() != null) {
                landNo = new String(Base64.getDecoder().decode(companyEntity.getAlternateNo().getBytes()));
                if (!companyEntity.getAlternateNo().isEmpty() && landNo.equals(companyRequest.getAlternateNo())){
                    responseBody.put(Constants.DUPLICATE_ALTERNATE_NO, companyRequest.getAlternateNo());
                }
            }

            if (companyRequest.getAlternateNo().equals(companyRequest.getMobileNo())){
                responseBody.put(Constants.DUPLICATE_AS_MOBILE_NO, companyRequest.getAlternateNo());
            }

            if (companyRequest.getEmailId().equals(companyRequest.getPersonalMailId())){
                responseBody.put(Constants.DUPLICATE_AS_EMAIL_NO, companyRequest.getEmailId());
            }
            if (companyRequest.getPanNo() != null && companyEntity.getPanNo() != null) {
                panNo = new String(Base64.getDecoder().decode(companyEntity.getPanNo().getBytes()));
                if (panNo.equals(companyRequest.getPanNo())){
                    responseBody.put(Constants.DUPLICATE_PAN_NO, companyRequest.getPanNo());
                }

            }
            if (companyRequest.getPersonalMailId() != null && companyEntity.getPersonalMailId() != null) {
                personalMail = new String(Base64.getDecoder().decode(companyEntity.getPersonalMailId()));
                if (personalMail.equals(companyRequest.getPersonalMailId())){
                    responseBody.put(Constants.DUPLICATE_PERSONAL_MAIL, companyRequest.getPersonalMailId());
                }

            }
            if (companyRequest.getPersonalMailId() != null && companyEntity.getEmailId() != null) {
                personalMail = new String(Base64.getDecoder().decode(companyEntity.getPersonalMailId()));
                mailId = companyEntity.getEmailId();
                if (personalMail.equals(mailId)){
                    responseBody.put(Constants.DUPLICATE_AS_EMAIL_NO, companyRequest.getPersonalMailId());
                }
            }

            if (companyRequest.getPersonalMobileNo() != null && companyEntity.getPersonalMobileNo() != null) {
                personalMobile = new String(Base64.getDecoder().decode(companyEntity.getPersonalMobileNo()));
                if (personalMobile.equals(companyRequest.getPersonalMobileNo())){
                    responseBody.put(Constants.DUPLICATE_PERSONAL_MOBILE, companyRequest.getPersonalMobileNo());
                }

            }

            if (companyEntity.getCinNo() != null && companyRequest.getCinNo() != null && !companyEntity.getCinNo().isEmpty()) {
                cinNo = new String(Base64.getDecoder().decode(companyEntity.getCinNo().getBytes()));
                if (cinNo.equals(companyRequest.getCinNo())){
                    responseBody.put(Constants.DUPLICATE_CIN_NO, companyRequest.getCinNo());
                }

            }
        }
        return responseBody;
    }

    public static Map<String, Object> duplicateUpdateValues(CompanyUpdateRequest companyUpdateRequest, List<CompanyEntity> companyEntities) {
        Map<String, Object> responseBody = new HashMap<>();
        String cinNo = null, regNo = null, mobileNo = null, landNo =  null, gstNo = null, panNo= null, personalMail = null, personalMobile = null;
        for (CompanyEntity companyEntity :companyEntities) {
            if (companyUpdateRequest.getMobileNo() != null && companyEntity.getMobileNo() != null) {
                mobileNo = new String(Base64.getDecoder().decode(companyEntity.getMobileNo().getBytes()));
                if (mobileNo.equals(companyUpdateRequest.getMobileNo())){
                    responseBody.put(Constants.DUPLICATE_MOBILE_NO, companyUpdateRequest.getMobileNo());
                }

            }
            if (companyUpdateRequest.getAlternateNo().equals(companyUpdateRequest.getMobileNo())){
                responseBody.put(Constants.DUPLICATE_AS_MOBILE_NO, companyUpdateRequest.getAlternateNo());
            }
            if (companyEntity.getEmailId().equals(companyUpdateRequest.getPersonalMailId())){
                responseBody.put(Constants.DUPLICATE_AS_EMAIL_NO, companyEntity.getEmailId());
            }
            if (companyUpdateRequest.getAlternateNo() != null && companyEntity.getAlternateNo() != null) {
                landNo = new String(Base64.getDecoder().decode(companyEntity.getAlternateNo().getBytes()));
                if (!companyEntity.getAlternateNo().isEmpty() && landNo.equals(companyUpdateRequest.getAlternateNo())){
                    responseBody.put(Constants.DUPLICATE_ALTERNATE_NO, companyUpdateRequest.getAlternateNo());
                }

            }

            if (companyUpdateRequest.getPersonalMailId() != null && companyEntity.getPersonalMailId() != null) {
                personalMail = new String(Base64.getDecoder().decode(companyEntity.getPersonalMailId()));
                if (personalMail.equals(companyUpdateRequest.getPersonalMailId())){
                    responseBody.put(Constants.DUPLICATE_PERSONAL_MAIL, companyUpdateRequest.getPersonalMailId());
                }

            }
            if (companyUpdateRequest.getPersonalMobileNo() != null && companyEntity.getPersonalMobileNo() != null) {
                personalMobile = new String(Base64.getDecoder().decode(companyEntity.getPersonalMobileNo()));
                if (personalMobile.equals(companyUpdateRequest.getPersonalMobileNo())){
                    responseBody.put(Constants.DUPLICATE_PERSONAL_MOBILE, companyUpdateRequest.getPersonalMobileNo());
                }

            }
        }
        return responseBody;

    }
    public static String getBaseUrl(HttpServletRequest request) {
        String scheme = request.getScheme(); // http or https
        String serverName = request.getServerName(); // localhost or IP address
        int serverPort = request.getServerPort(); // port number
        String contextPath = request.getContextPath(); // context path

        return scheme + "://" + serverName + ":" + serverPort + contextPath + "/";
    }

    public static SalaryConfigurationEntity maskSalaryStructureProperties(SalaryConfigurationRequest salaryConfigurationRequest, String resourceId) {
        ObjectMapper objectMapper = new ObjectMapper();

        // Convert the SalaryConfigurationRequest to SalaryConfigurationEntity
        SalaryConfigurationEntity entity = objectMapper.convertValue(salaryConfigurationRequest, SalaryConfigurationEntity.class);

        // Set the resource ID and type
        entity.setId(resourceId);
        entity.setType(Constants.SALARY_STRUCTURE);

        // Mask allowances and deductions as maps
        if (salaryConfigurationRequest.getAllowances() != null) {
            Map<String, String> maskedAllowances = new HashMap<>();
            for (Map.Entry<String, String> entry : salaryConfigurationRequest.getAllowances().entrySet()) {
                maskedAllowances.put(entry.getKey(), maskValue(entry.getValue())); // Mask the value
            }
            entity.setAllowances(maskedAllowances);
        }

        if (salaryConfigurationRequest.getDeductions() != null) {
            Map<String, String> maskedDeductions = new HashMap<>();
            for (Map.Entry<String, String> entry : salaryConfigurationRequest.getDeductions().entrySet()) {
                maskedDeductions.put(entry.getKey(), maskValue(entry.getValue())); // Mask the value
            }
            entity.setDeductions(maskedDeductions);
        }

        return entity;
    }

    // Helper method to mask the values
    private static String maskValue(String value) {
        if (value == null || value.isEmpty()) {
            return value; // Return as is if null or empty
        }
        return Base64.getEncoder().encodeToString(value.toString().getBytes()); // Replace with your desired masking pattern
    }


//    public static EmployeeSalaryEntity maskEmployeesSalaryProperties(EmployeeSalaryRequest salaryRequest, String id, String employeeId, SalaryConfigurationEntity salaryConfigurationEntity) {
//
//        String fix = null, gross = null, var= null, basic= null, net = null, te=null, totalDed=null, pfTax= null, incomeTax=null, ttax=null;
//
//        ObjectMapper objectMapper = new ObjectMapper();
//
//        EmployeeSalaryEntity entity = objectMapper.convertValue(salaryRequest, EmployeeSalaryEntity.class);
//        entity.setSalaryId(id);
//        entity.setEmployeeId(employeeId);
//        if (salaryRequest.getFixedAmount() != null) {
//            fix= (Base64.getEncoder().encodeToString(salaryRequest.getFixedAmount().toString().getBytes()));
//            entity.setFixedAmount(fix);
//        }
//        if (salaryRequest.getVariableAmount() != null) {
//            var= (Base64.getEncoder().encodeToString(salaryRequest.getVariableAmount().toString().getBytes()));
//            entity.setVariableAmount(var);
//        }
//        if (salaryRequest.getGrossAmount() != null) {
//            Double itax = TaxCalculatorUtils.getNewTax(Double.parseDouble(salaryRequest.getGrossAmount()));
//            Double ptax = TaxCalculatorUtils.getPfTax(Double.valueOf(salaryRequest.getGrossAmount()));
//            incomeTax=Base64.getEncoder().encodeToString(itax.toString().getBytes());
//            pfTax = Base64.getEncoder().encodeToString(ptax.toString().getBytes());
//            ttax= String.valueOf(itax+ptax);
//            gross= (Base64.getEncoder().encodeToString(salaryRequest.getGrossAmount().toString().getBytes()));
//            entity.setGrossAmount(gross);
//            entity.setIncomeTax(incomeTax);
//            entity.setPfTax(pfTax);
//
//        }
//        Map<String, String> allowances = new HashMap<>();
//        double totalAllowances = 0.0;
//        if (salaryConfigurationEntity != null && salaryConfigurationEntity.getAllowances() != null) {
//            for (Map.Entry<String, String> entry : salaryConfigurationEntity.getAllowances().entrySet()) {
//                String originalKey = entry.getKey();
//                String encodedValue = unMaskValue(entry.getValue());
//                String values = persentageOrValue(encodedValue, salaryRequest.getGrossAmount());
//                totalAllowances += Double.parseDouble(values);
//                String base64Value = Base64.getEncoder().encodeToString(String.valueOf(Math.round(Double.parseDouble(values))).getBytes());
//                allowances.put(originalKey, base64Value);
//            }
//        }
//
//        salaryConfigurationEntity.setAllowances(allowances);
//
//        double basicSalary= Double.valueOf(salaryRequest.getGrossAmount())-totalAllowances;
//        te = String.valueOf(basicSalary+totalAllowances);
//
//        basic = Base64.getEncoder().encodeToString(String.valueOf(basicSalary).getBytes());
//        entity.setBasicSalary(basic);
//
//        Map<String, String> deductions = new HashMap<>();
//
//        double totalDeduction = 0.0;
//        if (salaryConfigurationEntity != null && salaryConfigurationEntity.getDeductions() != null) {
//            for (Map.Entry<String, String> entry : salaryConfigurationEntity.getDeductions().entrySet()) {
//                String originalKey = entry.getKey();
//                String encodedValue = unMaskValue(entry.getValue());
//
//               String values = persentageOrValue(encodedValue, salaryRequest.getGrossAmount());
//               totalDeduction += Double.parseDouble(values);
//                String base64Value = Base64.getEncoder().encodeToString(String.valueOf(Math.round(Double.parseDouble(values))).getBytes());
//                deductions.put(originalKey, base64Value);
//
//            }
//            salaryConfigurationEntity.setDeductions(deductions);
//
//            totalDed = Base64.getEncoder().encodeToString(String.valueOf(totalDeduction).getBytes());
//            entity.setTotalDeductions(totalDed); // or set it to a specific field if needed
//        }
//
//        net = String.valueOf(Double.valueOf(te)-totalDeduction-Double.valueOf(ttax));
//        if (net!= null){
//            net=Base64.getEncoder().encodeToString(net.getBytes());
//            entity.setNetSalary(net);
//        }
//        if (te!= null){
//            te=Base64.getEncoder().encodeToString(te.getBytes());
//            entity.setTotalEarnings(te);
//        }
//        if (ttax!=null){
//            ttax = Base64.getEncoder().encodeToString(ttax.getBytes());
//            entity.setTotalTax(ttax);
//        }
//
//        entity.setSalaryConfigurationEntity(salaryConfigurationEntity);
//        entity.setType(Constants.SALARY);
//        return entity;
//    }
//
//    private static String persentageOrValue(String decodedString, String grossAmount) {
//        String result;
//        if (decodedString.endsWith("%")){
//            String percentageString = decodedString.replace("%", "");
//            double percentage = Double.parseDouble(percentageString)/100;
//            result = String.valueOf(percentage*Double.parseDouble(grossAmount));
//            return result;
//        }else {
//            return decodedString;
//        }
//    }

    public static EmployeeSalaryEntity maskEmployeesSalaryProperties(EmployeeSalaryRequest salaryRequest, String id, String employeeId, SalaryConfigurationEntity salaryConfigurationEntity) {

        String fix = null, gross = null, var= null, basic= null, net = null, te=null, totalDed=null, pfTax= null, incomeTax=null, ttax=null;

        ObjectMapper objectMapper = new ObjectMapper();

        EmployeeSalaryEntity entity = objectMapper.convertValue(salaryRequest, EmployeeSalaryEntity.class);
        entity.setSalaryId(id);
        entity.setEmployeeId(employeeId);
        if (salaryRequest.getFixedAmount() != null) {
            fix= (Base64.getEncoder().encodeToString(salaryRequest.getFixedAmount().toString().getBytes()));
            entity.setFixedAmount(fix);
        }
        if (salaryRequest.getVariableAmount() != null) {
            var= (Base64.getEncoder().encodeToString(salaryRequest.getVariableAmount().toString().getBytes()));
            entity.setVariableAmount(var);
        }
        if (salaryRequest.getIncomeTax().equals(Constants.NEW)){
            incomeTax = String.valueOf(TaxCalculatorUtils.getNewTax(Double.parseDouble(salaryRequest.getGrossAmount())));
        }else if(salaryRequest.getIncomeTax().equals(Constants.OLD)){
            incomeTax = String.valueOf(TaxCalculatorUtils.getOldTax(Double.parseDouble(salaryRequest.getGrossAmount())));
        }
        if (salaryRequest.getGrossAmount() != null) {
            pfTax  = String.valueOf(TaxCalculatorUtils.getPfTax(Double.parseDouble(salaryRequest.getGrossAmount())));
            gross= (Base64.getEncoder().encodeToString(salaryRequest.getGrossAmount().toString().getBytes()));
            entity.setGrossAmount(gross);
        }

        ttax = String.valueOf(Double.parseDouble(pfTax)+ Double.parseDouble(incomeTax));
        ttax = Base64.getEncoder().encodeToString(ttax.getBytes());
        entity.setTotalTax(ttax);
        if (pfTax != null){
            pfTax = Base64.getEncoder().encodeToString(pfTax.getBytes());;
            entity.setPfTax(pfTax);
        }
        if (incomeTax!=null){
            incomeTax = Base64.getEncoder().encodeToString(incomeTax.getBytes());
            entity.setIncomeTax(incomeTax);
        }
        Map<String, String> allowances = new HashMap<>();
        if (salaryRequest.getSalaryConfigurationEntity()!= null && salaryRequest.getSalaryConfigurationEntity().getAllowances() != null) {
            for (Map.Entry<String, String> entry : salaryRequest.getSalaryConfigurationEntity().getAllowances().entrySet()) {
                String originalKey = entry.getKey();
                String encodedValue = maskValue(entry.getValue());
                allowances.put(originalKey, encodedValue);
            }
        }

        salaryConfigurationEntity.setAllowances(allowances);

        Map<String, String> deductions = new HashMap<>();
        if (salaryRequest.getSalaryConfigurationEntity() != null && salaryRequest.getSalaryConfigurationEntity().getDeductions() != null) {
            for (Map.Entry<String, String> entry : salaryRequest.getSalaryConfigurationEntity().getDeductions().entrySet()) {
                String originalKey = entry.getKey();
                String encodedValue = maskValue(entry.getValue());
                deductions.put(originalKey, encodedValue);
            }
            salaryConfigurationEntity.setDeductions(deductions);
        }
        if (salaryRequest.getNetSalary()!= null){
            net=Base64.getEncoder().encodeToString(salaryRequest.getNetSalary().getBytes());
            entity.setNetSalary(net);
        }
        if (salaryRequest.getTotalEarnings()!= null){
            te=Base64.getEncoder().encodeToString(salaryRequest.getTotalEarnings().getBytes());
            entity.setTotalEarnings(te);
        }
        if (salaryRequest.getTotalDeductions() !=null){
            totalDed= Base64.getEncoder().encodeToString(salaryRequest.getTotalDeductions().getBytes());
            entity.setTotalDeductions(totalDed);
        }

        entity.setSalaryConfigurationEntity(salaryConfigurationEntity);
        entity.setType(Constants.SALARY);
        return entity;
    }

    private static String persentageOrValue(String decodedString, String grossAmount) {
        String result;
        if (decodedString.endsWith("%")){
            String percentageString = decodedString.replace("%", "");
            double percentage = Double.parseDouble(percentageString)/100;
            result = String.valueOf(percentage*Double.parseDouble(grossAmount));
            return result;
        }else {
            return decodedString;
        }
    }


    public static void unMaskCompanySalaryStructureProperties(SalaryConfigurationEntity salaryConfiguration) {
        if (salaryConfiguration.getAllowances() != null) {
            Map<String, String> decodedAllowances = new HashMap<>();
            for (Map.Entry<String, String> entry : salaryConfiguration.getAllowances().entrySet()) {
                decodedAllowances.put(entry.getKey(), unMaskValue(entry.getValue()));
            }
            salaryConfiguration.setAllowances(decodedAllowances); // Update the original object
        }

        if (salaryConfiguration.getDeductions() != null) {
            Map<String, String> decodedDeductions = new HashMap<>();
            for (Map.Entry<String, String> entry : salaryConfiguration.getDeductions().entrySet()) {
                decodedDeductions.put(entry.getKey(), unMaskValue(entry.getValue()));
            }
            salaryConfiguration.setDeductions(decodedDeductions); // Update the original object
        }
    }

    private static String unMaskValue(String value) {
        if (value == null || value.isEmpty()) {
            return value; // Return as is if null or empty
        }
        return new String(Base64.getDecoder().decode(value)); // Correctly decode without extra bytes conversion
    }


    public static Map<String, Object> duplicateValuesInTheCompany(CompanyUpdateRequest companyUpdateRequest, List<CompanyEntity> companyEntities) {

        Map<String, Object> responseBody = new HashMap<>();
        String cinNo = null, regNo = null, mobileNo = null, landNo =  null, gstNo = null, panNo= null, personalMail = null, personalMobile = null, emailId=null;
        for (CompanyEntity companyEntity :companyEntities) {

            if (companyUpdateRequest.getAlternateNo().equals(companyUpdateRequest.getMobileNo())){
                responseBody.put(Constants.DUPLICATE_AS_MOBILE_NO, companyUpdateRequest.getAlternateNo());
            }
            if (companyUpdateRequest.getPersonalMailId().equals(companyEntity.getEmailId())){
                responseBody.put(Constants.DUPLICATE_PERSONAL_MAIL, companyUpdateRequest.getPersonalMailId());
            }

        }
        return responseBody;
    }
    public static Map<String, Object> duplicateValuesInCompany(CompanyRequest companyRequest) {

        Map<String, Object> responseBody = new HashMap<>();

            if (companyRequest.getAlternateNo().equals(companyRequest.getMobileNo())){
                responseBody.put(Constants.DUPLICATE_AS_MOBILE_NO, companyRequest.getAlternateNo());
            }
            if (companyRequest.getEmailId().equals(companyRequest.getPersonalMailId())){
                responseBody.put(Constants.DUPLICATE_AS_EMAIL_NO, companyRequest.getEmailId());
            }

        return responseBody;
    }


    public static BufferedImage applyOpacity(BufferedImage originalImage, float opacity, double scaleFactor, double rotationDegrees) {
        int newWidth = (int) (originalImage.getWidth() * scaleFactor);
        int newHeight = (int) (originalImage.getHeight() * scaleFactor);
        double radians = Math.toRadians(-rotationDegrees);

        int rotatedWidth = (int) Math.abs(newWidth * Math.cos(radians)) + (int) Math.abs(newHeight * Math.sin(radians));
        int rotatedHeight = (int) Math.abs(newWidth * Math.sin(radians)) + (int) Math.abs(newHeight * Math.cos(radians));

        BufferedImage watermarkedImage = new BufferedImage(rotatedWidth, rotatedHeight, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = watermarkedImage.createGraphics();

        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);

        int centerX = rotatedWidth / 2;
        int centerY = rotatedHeight / 2;

        g2d.translate(centerX, centerY);
        g2d.rotate(radians);
        g2d.translate(-newWidth / 2, -newHeight / 2);

        Image scaledImage = originalImage.getScaledInstance(newWidth, newHeight, Image.SCALE_SMOOTH);

        // Apply opacity directly to the image being drawn without background color.
        g2d.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, opacity));
        g2d.drawImage(scaledImage, 0, 0, null);

        g2d.dispose();

        return watermarkedImage;
    }

    public static RelievingEntity relievingProperties(RelievingRequest request, String id, String employeeId) {

        ObjectMapper objectMapper = new ObjectMapper();
        RelievingEntity relievingEntity = objectMapper.convertValue(request, RelievingEntity.class);
        relievingEntity.setId(id);
        relievingEntity.setEmployeeId(employeeId);
        relievingEntity.setType(Constants.RELIEVING);

        return relievingEntity;
    }

    public static RelievingEntity maskUpdateRelievingProperties(RelievingRequest relievingRequest, RelievingEntity relievingEntity) {
        if (relievingRequest.getRelievingDate() != null) {
            relievingEntity.setRelievingDate(relievingRequest.getRelievingDate());
        }
        if (relievingRequest.getNoticePeriod() != null) {
            relievingEntity.setNoticePeriod(relievingRequest.getNoticePeriod());
        }
        if (relievingRequest.getResignationDate() != null) {
            relievingEntity.setResignationDate(relievingRequest.getResignationDate());
        }

        return relievingEntity;
    }



    public static TemplateEntity addTemplateProperties(TemplateEntity existingEntity, TemplateRequest templateRequest, String resourceId, String companyId) {
        // If no existing entity is found, initialize a new TemplateEntity
        TemplateEntity entity = (existingEntity != null) ? existingEntity : new TemplateEntity();

        // Set the resource ID and company ID
        entity.setId(resourceId);
        entity.setCompanyId(companyId);
        entity.setType(Constants.TEMPLATE);

        // Update template numbers if they are present in templateRequest, otherwise keep the existing value
        if (templateRequest.getAppraisalTemplateNo() != null) {
            entity.setAppraisalTemplateNo(templateRequest.getAppraisalTemplateNo());
        }
        if (templateRequest.getExperienceTemplateNo() != null) {
            entity.setExperienceTemplateNo(templateRequest.getExperienceTemplateNo());
        }
        if (templateRequest.getPayslipTemplateNo() != null) {
            entity.setPayslipTemplateNo(templateRequest.getPayslipTemplateNo());
        }
        if (templateRequest.getRelievingTemplateNo() != null) {
            entity.setRelievingTemplateNo(templateRequest.getRelievingTemplateNo());
        }
        if (templateRequest.getOfferLetterTemplateNo() != null) {
            entity.setOfferLetterTemplateNo(templateRequest.getOfferLetterTemplateNo());
        }
        if (templateRequest.getInternshipTemplateNo() != null) {
            entity.setInternshipTemplateNo(templateRequest.getInternshipTemplateNo());
        }

        return entity;
    }

}