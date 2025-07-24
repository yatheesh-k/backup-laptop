package com.pb.employee.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.*;
import com.pb.employee.persistance.model.EmployeeAccounts.EmployeeResponseEntity;
import com.pb.employee.request.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.Month;
import java.util.*;
import java.util.Base64;
import java.util.stream.Collectors;

@Slf4j
@Component
public class EmployeeUtils {

    public static Entity maskEmployeeProperties(EmployeeRequest employeeRequest,String resourceId, String companyId, String defaultPassword, String candidateId) {
        String uan = null, pan = null, adharId = null, accountNo=null, ifscCode = null,password=null, mobileNo=null, altNo= null;
        if(employeeRequest.getPanNo() != null) {
            pan = Base64.getEncoder().encodeToString(employeeRequest.getPanNo().getBytes());
        }
//        if(employeeRequest.getPassword() != null) {
//            password = Base64.getEncoder().encodeToString(employeeRequest.getPassword().getBytes());
//        }
        if(employeeRequest.getUanNo() != null) {
            uan = Base64.getEncoder().encodeToString(employeeRequest.getUanNo().getBytes());
        }
        if(employeeRequest.getAadhaarId() != null) {
            adharId = Base64.getEncoder().encodeToString(employeeRequest.getAadhaarId().getBytes());
        }
        if(employeeRequest.getIfscCode() != null) {
            ifscCode = Base64.getEncoder().encodeToString(employeeRequest.getIfscCode().getBytes());
        }
        if(employeeRequest.getAccountNo() != null) {
            accountNo = Base64.getEncoder().encodeToString(employeeRequest.getAccountNo().getBytes());
        }
        if(employeeRequest.getMobileNo() != null) {
            mobileNo = Base64.getEncoder().encodeToString(employeeRequest.getMobileNo().getBytes());
        }
        if(employeeRequest.getAlternateNo() != null) {
            altNo = Base64.getEncoder().encodeToString(employeeRequest.getAlternateNo().getBytes());
        }
        // Encode default password
        password = Base64.getEncoder().encodeToString(defaultPassword.getBytes());

        ObjectMapper objectMapper = new ObjectMapper();

        EmployeeEntity entity = objectMapper.convertValue(employeeRequest, EmployeeEntity.class);
        entity.setId(resourceId);
        entity.setCompanyId(companyId);
        entity.setPassword(password);
        entity.setAadhaarId(adharId);
        entity.setPanNo(pan);
        entity.setUanNo(uan);
        entity.setIfscCode(ifscCode);
        entity.setAccountNo(accountNo);
        entity.setMobileNo(mobileNo);
        entity.setAlternateNo(altNo);
        entity.setType(Constants.EMPLOYEE);
        entity.setCandidateId(candidateId);
        return entity;
    }

    public static Entity unmaskEmployeeProperties(EmployeeEntity employeeEntity, DepartmentEntity entity, DesignationEntity designationEntity) {
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
        if (entity != null && employeeEntity.getDepartment() != null) {
            employeeEntity.setDepartmentName(entity.getName());
        }else {
            employeeEntity.setDepartmentName(null);
        }
        if (designationEntity != null && employeeEntity.getDesignation() != null) {
            employeeEntity.setDesignationName(designationEntity.getName());
        }else {
            employeeEntity.setDesignationName(null);
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

    public static Map<String, Object> duplicateValues(EmployeeRequest employeeRequest, List<EmployeeEntity> employees) throws EmployeeException {
        Map<String, Object> responseBody = new HashMap<>();

            for (EmployeeEntity employeeEntity : employees) {
                String aadhaarId = null, uanNo = null, accountNo = null, mobileNo=null;
                if (employeeEntity.getEmployeeId() != null && employeeEntity.getEmployeeId().equals(employeeRequest.getEmployeeId())) {
                    responseBody.put(Constants.DUPLICATE_EMPLOYEE_ID, employeeRequest.getEmployeeId());

                }
                if (employeeEntity.getAadhaarId()!=null) {
                    aadhaarId = new String((Base64.getDecoder().decode(employeeEntity.getAadhaarId().toString().getBytes())));
                    if (aadhaarId.equals(employeeRequest.getAadhaarId())) {
                        responseBody.put(Constants.DUPLICATE_AADHAAR_ID, employeeRequest.getAadhaarId());
                    }
                }
                if (employeeEntity.getMobileNo()!=null) {
                    mobileNo = new String((Base64.getDecoder().decode(employeeEntity.getMobileNo().toString().getBytes())));
                    if (mobileNo.equals(employeeRequest.getMobileNo())) {
                        responseBody.put(Constants.DUPLICATE_MOBILE_NO, employeeRequest.getMobileNo());
                    }
                }
                if (employeeEntity.getUanNo() != null) {
                    uanNo = new String((Base64.getDecoder().decode(employeeEntity.getUanNo().toString().getBytes())));
                    if (uanNo.equals(employeeRequest.getUanNo()) && !uanNo.isEmpty()) {
                        responseBody.put(Constants.DUPLICATE_UAN_NO, employeeRequest.getUanNo());
                    }
                }
                if (employeeEntity.getAccountNo() != null) {
                    accountNo = new String((Base64.getDecoder().decode(employeeEntity.getAccountNo().toString().getBytes())));
                    if (accountNo.equals(employeeRequest.getAccountNo())) {
                        responseBody.put(Constants.DUPLICATE_ACCOUNT_NO, employeeRequest.getAccountNo());
                    }
                }
            }
        return responseBody;
    }
    public static Map<String, Object> duplicateUpdateValues(EmployeeUpdateRequest employeeUpdateRequest, List<EmployeeEntity> employees) throws EmployeeException {
        Map<String, Object> responseBody = new HashMap<>();
         // Iterate through the list to check for duplicates
            for (EmployeeEntity employeeEntity : employees) {
                String accountNo = null;
                if (employeeEntity.getAccountNo() != null) {
                    accountNo = new String((Base64.getDecoder().decode(employeeEntity.getAccountNo().toString().getBytes())));
                    if (accountNo.equals(employeeUpdateRequest.getAccountNo())) {
                        responseBody.put(Constants.DUPLICATE_ACCOUNT_NO, employeeUpdateRequest.getAccountNo());
                    }
                }
            }

        return responseBody;
    }

    public static int duplicateEmployeeProperties(EmployeeEntity user, EmployeePersonnelEntity employeePersonnel, EmployeeUpdateRequest employeeUpdateRequest) {
        int noOfChanges = 0;
        String type=null, email=null;
        if (!user.getEmployeeType().equals(employeeUpdateRequest.getEmployeeType())){
            noOfChanges+=1;
        }
        if (!user.getDesignation().equals(employeeUpdateRequest.getDesignation())){
            noOfChanges +=1;
        }
        if (!user.getDepartment().equals(employeeUpdateRequest.getDepartment())){
            noOfChanges +=1;
        }
        if (!user.getLocation().equals(employeeUpdateRequest.getLocation())){
            noOfChanges +=1;
        }if (!user.getManager().equals(employeeUpdateRequest.getManager())){
            noOfChanges +=1;
        }if (user.getMobileNo() != null && !user.getMobileNo().isEmpty()) {
            String mobile =  new String(Base64.getDecoder().decode(user.getMobileNo().getBytes())).trim();
            if (!mobile.equals(employeeUpdateRequest.getMobileNo().trim())) {
                noOfChanges += 1;
            }
    }else if (user.getMobileNo() == null && employeeUpdateRequest.getMobileNo() != null){
            noOfChanges +=1;
        }if (user.getAlternateNo() != null && employeeUpdateRequest.getAlternateNo()!= null){
            String alterNo = new String(Base64.getDecoder().decode(user.getAlternateNo().getBytes())).trim();
            if (!alterNo.equals(employeeUpdateRequest.getAlternateNo().trim())){
                noOfChanges += 1;
            }
        }else if (user.getAlternateNo() == null && employeeUpdateRequest.getAlternateNo() != null){
            noOfChanges +=1;
        }
        if (user.getPermanentAddress() != null && !user.getPermanentAddress().isEmpty()){
            if (!user.getPermanentAddress().equals(employeeUpdateRequest.getPermanentAddress())){
                noOfChanges += 1;
            }
        }else if (user.getPermanentAddress() == null && employeeUpdateRequest.getPermanentAddress() != null){
            noOfChanges +=1;
        }
        if (user.getTempAddress() != null && !user.getTempAddress().isEmpty()){
            if (!user.getTempAddress().equals(employeeUpdateRequest.getTempAddress())){
                noOfChanges += 1;
            }
        }else if (user.getTempAddress() == null && employeeUpdateRequest.getTempAddress() != null){
            noOfChanges +=1;
        }
        if (user.getMaritalStatus() != null && !user.getMaritalStatus().isEmpty()){
            if (!user.getMaritalStatus().equals(employeeUpdateRequest.getMaritalStatus())){
                noOfChanges += 1;
            }
        }else if (user.getMaritalStatus() == null && employeeUpdateRequest.getMaritalStatus() != null){
            noOfChanges +=1;
        }
        if (!user.getStatus().equals(employeeUpdateRequest.getStatus())){
            noOfChanges +=1;
        }if (!user.getIfscCode().isEmpty()) {
           String ifsc = new String((Base64.getDecoder().decode(user.getIfscCode().toString().getBytes())));

            if (!ifsc.equals(employeeUpdateRequest.getIfscCode())) {
                noOfChanges += 1;
            }
        }if (!user.getAccountNo().isEmpty()) {
            String account = new String(Base64.getDecoder().decode(user.getAccountNo().toString().getBytes()));
            if (!account.equals(employeeUpdateRequest.getAccountNo())) {
                noOfChanges += 1;
            }
        }if (!user.getBankName().equals(employeeUpdateRequest.getBankName())){
            noOfChanges +=1;
        }

        if (employeePersonnel != null) {
            noOfChanges += compareEmployeeExperience(
                    employeePersonnel.getEmployeeExperience(),
                    employeeUpdateRequest.getPersonnelEntity().getEmployeeExperience()
            );

            noOfChanges += compareEmployeeEducation(
                    employeePersonnel.getEmployeeEducation(),
                    employeeUpdateRequest.getPersonnelEntity().getEmployeeEducation()
            );
        }
        return noOfChanges;
    }

    /**
     * Compares two lists of EmployeeEducation and returns the number of differences.
     *
     * @param currentEducationList The list of current EmployeeEducation entries.
     * @param updatedEducationList The list of updated EmployeeEducation entries.
     * @return The number of differences between the two lists.
     */
    public static int compareEmployeeEducation(List<EmployeeEducation> currentEducationList, List<EmployeeEducation> updatedEducationList) {
        int changes = 0;
        if (currentEducationList == null) {
            currentEducationList = Collections.emptyList();
        }
        if (updatedEducationList == null) {
            updatedEducationList = Collections.emptyList();
        }
        List<EmployeeEducation> finalUpdatedEducationList = updatedEducationList;
        changes += (int) currentEducationList.stream()
                .filter(currentEducation ->
                        finalUpdatedEducationList.stream().noneMatch(updatedEducation ->
                                (currentEducation.getEducationLevel() != null && updatedEducation.getEducationLevel() != null && currentEducation.getEducationLevel().equals(updatedEducation.getEducationLevel())) &&
                                        (currentEducation.getInstituteName() != null && updatedEducation.getInstituteName() != null && currentEducation.getInstituteName().equals(updatedEducation.getInstituteName())) &&
                                        (currentEducation.getBoardOfStudy() != null && updatedEducation.getBoardOfStudy() != null && currentEducation.getBoardOfStudy().equals(updatedEducation.getBoardOfStudy())) &&
                                        (currentEducation.getBranch() != null && updatedEducation.getBranch() != null && currentEducation.getBranch().equals(updatedEducation.getBranch())) &&
                                        (currentEducation.getYear() != null && updatedEducation.getYear() != null && currentEducation.getYear().equals(updatedEducation.getYear())) &&
                                        (currentEducation.getPercentage() != null && updatedEducation.getPercentage() != null && currentEducation.getPercentage().equals(updatedEducation.getPercentage()))
                        )
                )
                .count();
        List<EmployeeEducation> finalCurrentEducationList = currentEducationList;
        changes += (int) updatedEducationList.stream()
                .filter(updatedEducation ->
                        finalCurrentEducationList.stream().noneMatch(currentEducation ->
                                (currentEducation.getEducationLevel() != null && updatedEducation.getEducationLevel() != null && currentEducation.getEducationLevel().equals(updatedEducation.getEducationLevel())) &&
                                        (currentEducation.getInstituteName() != null && updatedEducation.getInstituteName() != null && currentEducation.getInstituteName().equals(updatedEducation.getInstituteName())) &&
                                        (currentEducation.getBoardOfStudy() != null && updatedEducation.getBoardOfStudy() != null && currentEducation.getBoardOfStudy().equals(updatedEducation.getBoardOfStudy())) &&
                                        (currentEducation.getBranch() != null && updatedEducation.getBranch() != null && currentEducation.getBranch().equals(updatedEducation.getBranch())) &&
                                        (currentEducation.getYear() != null && updatedEducation.getYear() != null && currentEducation.getYear().equals(updatedEducation.getYear())) &&
                                        (currentEducation.getPercentage() != null && updatedEducation.getPercentage() != null && currentEducation.getPercentage().equals(updatedEducation.getPercentage()))
                        )
                )
                .count();

        return changes;
    }


    /**
     * Compares two lists of EmployeeExperience and returns the number of differences.
     *
     * @param currentExperienceList The list of current EmployeeExperience entries.
     * @param updatedExperienceList The list of updated EmployeeExperience entries.
     * @return The number of differences between the two lists.
     */
    public static int compareEmployeeExperience(List<EmployeeExperience> currentExperienceList, List<EmployeeExperience> updatedExperienceList) {
        int changes = 0;

        // Check for null lists to avoid NullPointerException
        if (currentExperienceList == null) {
            currentExperienceList = Collections.emptyList();
        }
        if (updatedExperienceList == null) {
            updatedExperienceList = Collections.emptyList();
        }
        List<EmployeeExperience> finalUpdatedExperienceList = updatedExperienceList;
        changes += (int) currentExperienceList.stream()
                .filter(currentExperience ->
                        finalUpdatedExperienceList.stream().noneMatch(updatedExperience ->
                                (currentExperience.getCompanyName() != null && updatedExperience.getCompanyName() != null && currentExperience.getCompanyName().equals(updatedExperience.getCompanyName())) &&
                                        (currentExperience.getPositionOrTitle() != null && updatedExperience.getPositionOrTitle() != null && currentExperience.getPositionOrTitle().equals(updatedExperience.getPositionOrTitle())) &&
                                        (currentExperience.getStartDate() != null && updatedExperience.getStartDate() != null && currentExperience.getStartDate().equals(updatedExperience.getStartDate())) &&
                                        (currentExperience.getEndDate() != null && updatedExperience.getEndDate() != null && currentExperience.getEndDate().equals(updatedExperience.getEndDate()))
                        )
                )
                .count();

        List<EmployeeExperience> finalCurrentExperienceList = currentExperienceList;
        changes += (int) updatedExperienceList.stream()
                .filter(updatedExperience ->
                        finalCurrentExperienceList.stream().noneMatch(currentExperience ->
                                (currentExperience.getCompanyName() != null && updatedExperience.getCompanyName() != null && currentExperience.getCompanyName().equals(updatedExperience.getCompanyName())) &&
                                        (currentExperience.getPositionOrTitle() != null && updatedExperience.getPositionOrTitle() != null && currentExperience.getPositionOrTitle().equals(updatedExperience.getPositionOrTitle())) &&
                                        (currentExperience.getStartDate() != null && updatedExperience.getStartDate() != null && currentExperience.getStartDate().equals(updatedExperience.getStartDate())) &&
                                        (currentExperience.getEndDate() != null && updatedExperience.getEndDate() != null && currentExperience.getEndDate().equals(updatedExperience.getEndDate()))
                        )
                )
                .count();

        return changes;
    }




    public static EmployeeResponseEntity unMaskEmployeeAccountProperties(EmployeeSalaryEntity salaryEntity, EmployeeEntity employee) {
        String te= null, tax = null, itax = null, ttax = null, tded = null, net = null;
        Double pfEmpr = null, pfEmp= null;
        EmployeeResponseEntity employeeResponseEntity = new EmployeeResponseEntity();

        if(salaryEntity.getPfTax() != null) {
            tax = new String((Base64.getDecoder().decode(salaryEntity.getPfTax().toString().getBytes())));
            double pfTax = Double.parseDouble(tax); // Parse tax to double
            employeeResponseEntity.setPfTax(String.format("%.2f",pfTax/12));
        }
        if (salaryEntity.getIncomeTax() != null){
            itax = new String((Base64.getDecoder().decode(salaryEntity.getIncomeTax().toString().getBytes())));
            salaryEntity.setIncomeTax(itax);
            double incomeTax = Double.parseDouble(itax); // Parse itax to double
            employeeResponseEntity.setTds(String.format("%.2f",incomeTax/12));
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
            employeeResponseEntity.setEmployeeSalary(String.format("%.2f",netAmount/12));
        }

        if (salaryEntity.getSalaryConfigurationEntity().getDeductions() != null) {
            Map<String, String> decodedDeductions = new HashMap<>();
            for (Map.Entry<String, String> entry : salaryEntity.getSalaryConfigurationEntity().getDeductions().entrySet()) {
                if (entry.getKey().equalsIgnoreCase("Provident Fund Employee")) {
                    String pfEmployer = unMaskValue(entry.getValue());
                    pfEmp = Double.parseDouble(pfEmployer); // Parse pf to double
                    employeeResponseEntity.setPfAmount(String.format("%.2f",pfEmp/12));
                }
                if (entry.getKey().equalsIgnoreCase("Provident Fund Employer")) {
                    String pfEmployer = unMaskValue(entry.getValue());
                    pfEmpr = Double.parseDouble(pfEmployer); // Parse pf to double
                    employeeResponseEntity.setPfAmount(String.format("%.2f", pfEmpr / 12));                }
            }
            employeeResponseEntity.setPfAmount(String.valueOf((pfEmpr + pfEmp)));
            employeeResponseEntity.setFirstName(employee.getFirstName());
            employeeResponseEntity.setLastName(employee.getLastName());
            employeeResponseEntity.setEmailId(employee.getEmailId());
            employeeResponseEntity.setUanNumber(employee.getUanNo() != null ? employee.getUanNo() : null);
            employeeResponseEntity.setAadhaarId(employee.getAadhaarId() != null ? employee.getAadhaarId() : null);
            employeeResponseEntity.setPanNo(employee.getPanNo() != null ? employee.getPanNo() : null);
        }
        return employeeResponseEntity;
    }
    public static EmployeeSalaryEntity unMaskEmployeeSalaryProperties(EmployeeSalaryEntity salaryEntity) {

        String var = null, fix = null, bas = null, gross = null;
        String hra = null, trav = null, pfc = null, other = null,spa=null;
        String te= null, pfE = null, pfEmployer =null, lop = null, tax = null, itax = null, ttax = null, tded = null, net = null;
        if(salaryEntity.getFixedAmount() != null) {
            fix = new String((Base64.getDecoder().decode(salaryEntity.getFixedAmount().toString().getBytes())));
            salaryEntity.setFixedAmount(fix);
        }

        if(salaryEntity.getVariableAmount() != null) {
            var = new String(Base64.getDecoder().decode(salaryEntity.getVariableAmount().toString().getBytes()));
            salaryEntity.setVariableAmount(var);
        }
        if(salaryEntity.getGrossAmount() != null) {
            gross = new String((Base64.getDecoder().decode(salaryEntity.getGrossAmount().toString().getBytes())));
            salaryEntity.setGrossAmount(gross);
        }

        if(salaryEntity.getTotalEarnings() != null) {
            te = new String((Base64.getDecoder().decode(salaryEntity.getTotalEarnings().toString().getBytes())));
            salaryEntity.setTotalEarnings(te);
        }
        if(salaryEntity.getTotalDeductions() != null) {
            tded = new String((Base64.getDecoder().decode(salaryEntity.getTotalDeductions().toString().getBytes())));
            salaryEntity.setTotalDeductions(tded);
        }

        if(salaryEntity.getPfTax() != null) {
            tax = new String((Base64.getDecoder().decode(salaryEntity.getPfTax().toString().getBytes())));
            salaryEntity.setPfTax(tax);
        }
        if (salaryEntity.getIncomeTax() != null){
            itax = new String((Base64.getDecoder().decode(salaryEntity.getIncomeTax().toString().getBytes())));
            salaryEntity.setIncomeTax(itax);
        }
        if(salaryEntity.getTotalTax() != null) {
            ttax = new String((Base64.getDecoder().decode(salaryEntity.getTotalTax().toString().getBytes())));
            salaryEntity.setTotalTax(ttax);
        }
        if (salaryEntity.getNetSalary() != null) {
            // Convert tded and ttax from String to double
            double tdedValue = Double.parseDouble(tded); // Parse tded to double
            double ttaxValue = Double.parseDouble(ttax);  // Parse ttax to double
            double tEarValue = Double.parseDouble(te);  // Parse te to double

            double totalAmount = tdedValue+ttaxValue;
            double netAmount = tEarValue -totalAmount;
            // Convert the result to String
            net = String.valueOf(netAmount);
            salaryEntity.setNetSalary(net);
        }

        if (salaryEntity.getSalaryConfigurationEntity().getAllowances() != null) {
            Map<String, String> decodedAllowances = new HashMap<>();
            for (Map.Entry<String, String> entry : salaryEntity.getSalaryConfigurationEntity().getAllowances().entrySet()) {
                decodedAllowances.put(entry.getKey(), unMaskValue(entry.getValue()));
            }
            salaryEntity.getSalaryConfigurationEntity().setAllowances(decodedAllowances); // Update the original object
        }

        if (salaryEntity.getSalaryConfigurationEntity().getDeductions() != null) {
            Map<String, String> decodedDeductions = new HashMap<>();
            for (Map.Entry<String, String> entry : salaryEntity.getSalaryConfigurationEntity().getDeductions().entrySet()) {
                decodedDeductions.put(entry.getKey(), unMaskValue(entry.getValue()));
            }
            salaryEntity.getSalaryConfigurationEntity().setDeductions(decodedDeductions); // Update the original object
        }
        salaryEntity.setType(Constants.SALARY);
        return salaryEntity;
    }

    private static String unMaskValue(String value) {
        if (value == null || value.isEmpty()) {
            return value; // Return as is if null or empty
        }
        return new String(Base64.getDecoder().decode(value)); // Correctly decode without extra bytes conversion
    }

    public static int duplicateCompanyProperties(CompanyEntity user, CompanyUpdateRequest companyUpdateRequest) {
        int noOfChanges = 0;
        if(!user.getCompanyAddress().equals(companyUpdateRequest.getCompanyAddress())){
           noOfChanges +=1;
        }
        if (user.getMobileNo() !=null){
           String mobileNo = new String(Base64.getDecoder().decode(user.getMobileNo()));
           if (!mobileNo.equals(companyUpdateRequest.getMobileNo())){
            noOfChanges +=1;
           }
        }
        if (user.getAlternateNo() !=null){
           String alternate = new String(Base64.getDecoder().decode(user.getAlternateNo()));
           if (!alternate.equals(companyUpdateRequest.getAlternateNo())){
                noOfChanges +=1;
           }
        }else if (companyUpdateRequest.getAlternateNo()!= null){
            noOfChanges+=1;
        }

        if(!user.getName().equals(companyUpdateRequest.getName())){
            noOfChanges +=1;
        }
        if (user.getPersonalMobileNo() !=null){
            String prMobileNo = new String(Base64.getDecoder().decode(user.getPersonalMobileNo()));
            if (!prMobileNo.equals(companyUpdateRequest.getPersonalMobileNo())){
                noOfChanges +=1;
            }
        }
        if (user.getPersonalMailId() !=null){
            String prMailId = new String(Base64.getDecoder().decode(user.getPersonalMailId()));
            if (!prMailId.equals(companyUpdateRequest.getPersonalMailId())){
                noOfChanges +=1;
            }
        }
        if(!user.getAddress().equals(companyUpdateRequest.getAddress())){
            noOfChanges +=1;
        }
    return noOfChanges;
    }


    public static int duplicateSalaryProperties(EmployeeSalaryEntity employee, SalaryUpdateRequest salaryUpdateRequest) {
        int noOfChanges = 0;
        if (!employee.getNetSalary().equals(salaryUpdateRequest.getNetSalary())){
            String netSalary = new String((Base64.getDecoder().decode(employee.getNetSalary().toString().getBytes())));

            if (!netSalary.equals(salaryUpdateRequest.getNetSalary())) {
                noOfChanges += 1;
            }
        }
        if (!employee.getFixedAmount().equals(salaryUpdateRequest.getFixedAmount())){
            String fixedAmount = new String((Base64.getDecoder().decode(employee.getFixedAmount().toString().getBytes())));

            if (!fixedAmount.equals(salaryUpdateRequest.getFixedAmount())) {
                noOfChanges += 1;
            }
        }
        if (!employee.getTotalDeductions().equals(salaryUpdateRequest.getTotalDeductions())){
            String totalDeductions= new String((Base64.getDecoder().decode(employee.getTotalDeductions().toString().getBytes())));

            if (!totalDeductions.equals(salaryUpdateRequest.getTotalDeductions())) {
                noOfChanges += 1;
            }
        }
        if (!employee.getStatus().equals(salaryUpdateRequest.getStatus())){
            noOfChanges +=1;
        }
        if (!employee.getTotalEarnings().isEmpty()) {
            String totalEarnings = new String((Base64.getDecoder().decode(employee.getTotalEarnings().toString().getBytes())));

            if (!totalEarnings.equals(salaryUpdateRequest.getTotalEarnings())) {
                noOfChanges += 1;
            }
        }if (!employee.getTotalDeductions().isEmpty()) {
            String deductions = new String(Base64.getDecoder().decode(employee.getTotalDeductions().toString().getBytes()));
            if (!deductions.equals(salaryUpdateRequest.getTotalDeductions())) {
                noOfChanges += 1;
            }
        }
        if (!employee.getVariableAmount().isEmpty()) {
            String variable = new String(Base64.getDecoder().decode(employee.getVariableAmount().toString().getBytes()));
            if (!variable.equals(salaryUpdateRequest.getVariableAmount())) {
                noOfChanges += 1;
            }
        }
        if (!employee.getGrossAmount().isEmpty()) {
           String grossAmount = new String(Base64.getDecoder().decode(employee.getGrossAmount().toString().getBytes()));
           if (!grossAmount.equals(salaryUpdateRequest.getGrossAmount())) {
           noOfChanges += 1;
           }
        }
        // Compare allowance values with Base64 decoding
        if (employee.getSalaryConfigurationEntity().getAllowances() != null && salaryUpdateRequest.getSalaryConfigurationRequest().getAllowances() != null) {
            Map<String, String> employeeAllowances = employee.getSalaryConfigurationEntity().getAllowances();
            Map<String, String> requestAllowances = salaryUpdateRequest.getSalaryConfigurationRequest().getAllowances();

            for (Map.Entry<String, String> entry : employeeAllowances.entrySet()) {
                String employeeAllowanceValue = entry.getValue();
                String requestAllowanceValue = requestAllowances.get(entry.getKey());

                if (employeeAllowanceValue != null && requestAllowanceValue != null) {
                    String decodedEmployeeAllowance = new String(Base64.getDecoder().decode(employeeAllowanceValue.getBytes()));
                    if (!decodedEmployeeAllowance.equals(requestAllowanceValue)) {
                        noOfChanges++;
                    }
                }
            }
        }

        // Compare deduction values with Base64 decoding
        if (employee.getSalaryConfigurationEntity().getDeductions() != null && salaryUpdateRequest.getSalaryConfigurationRequest().getDeductions() != null) {
            Map<String, String> employeeDeductions = employee.getSalaryConfigurationEntity().getDeductions();
            Map<String, String> requestDeductions = salaryUpdateRequest.getSalaryConfigurationRequest().getDeductions();

            for (Map.Entry<String, String> entry : employeeDeductions.entrySet()) {
                String employeeDeductionValue = entry.getValue();
                String requestDeductionValue = requestDeductions.get(entry.getKey());

                if (employeeDeductionValue != null && requestDeductionValue != null) {
                    String decodedEmployeeDeduction = new String(Base64.getDecoder().decode(employeeDeductionValue.getBytes()));
                    if (!decodedEmployeeDeduction.equals(requestDeductionValue)) {
                        noOfChanges++;
                    }
                }
            }
        }
        return noOfChanges;
    }

    public static List<EmployeeEntity> filterEmployeesWithoutAttendance(
            List<EmployeeEntity> employees,
            List<AttendanceEntity> attendanceRecords,
            String month,
            String year
    ) {
        Set<String> employeesWithAttendance = attendanceRecords.stream()
                .map(AttendanceEntity::getEmployeeId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Month monthEnum = Month.valueOf(month.toUpperCase(Locale.ENGLISH));
        int monthNumber = monthEnum.getValue();
        int yearNumber = Integer.parseInt(year);

        LocalDate endOfMonth = LocalDate.of(yearNumber, monthNumber, 1)
                .withDayOfMonth(LocalDate.of(yearNumber, monthNumber, 1).lengthOfMonth());

        return employees.stream()
                .filter(emp -> Constants.ACTIVE.equalsIgnoreCase(emp.getStatus()))
                .filter(emp -> {
                    try {
                        String hiringDateStr = emp.getDateOfHiring();
                        if (hiringDateStr == null || hiringDateStr.isBlank()) return false;
                        LocalDate dateOfHiring = LocalDate.parse(hiringDateStr);
                        return !dateOfHiring.isAfter(endOfMonth);
                    } catch (Exception e) {
                        return false;
                    }
                })
                .filter(emp -> {
                    String id = emp.getId();
                    return (id == null || !employeesWithAttendance.contains(id));
                })
                .collect(Collectors.toList());
    }
    public static AppraisalEntity maskAppraisalProperties(AppraisalLetterRequest appraisalLetterRequest, String resourceId, String companyId, String employeeId) {
        String gross = null, hike = null;

        if(appraisalLetterRequest.getGrossCompensation() != null) {
           gross = Base64.getEncoder().encodeToString(appraisalLetterRequest.getGrossCompensation().getBytes(StandardCharsets.UTF_8));
        }
        if (appraisalLetterRequest.getSalaryHikePersentage() != null) {
            hike = Base64.getEncoder().encodeToString(appraisalLetterRequest.getSalaryHikePersentage().getBytes(StandardCharsets.UTF_8));
        }
        ObjectMapper objectMapper = new ObjectMapper();
        AppraisalEntity entity = objectMapper.convertValue(appraisalLetterRequest, AppraisalEntity.class);
        entity.setGrossCompensation(gross);
        entity.setSalaryHikePersentage(hike);
        entity.setId(resourceId);
        entity.setCompanyId(companyId);
        entity.setEmployeeId(employeeId);
        entity.setType(Constants.APPRAISAL);
        return entity;
    }

    public static AppraisalEntity unmaskAppraisalProperties(AppraisalEntity appraisalEntity) {
        String gross = null, hike = null;
        if(appraisalEntity.getGrossCompensation() != null) {
            gross = new String(Base64.getDecoder().decode(appraisalEntity.getGrossCompensation().getBytes(StandardCharsets.UTF_8)));
            appraisalEntity.setGrossCompensation(gross);
        }
        if (appraisalEntity.getSalaryHikePersentage() != null) {
            hike = new String(Base64.getDecoder().decode(appraisalEntity.getSalaryHikePersentage().getBytes(StandardCharsets.UTF_8)));
            appraisalEntity.setSalaryHikePersentage(hike);
        }
        return appraisalEntity;
    }

    public static AppraisalUpdateRequest maskAppraisalUpdateProperties(AppraisalUpdateRequest appraisalUpdateRequest) {
        String gross = null, hike = null;

        if(appraisalUpdateRequest.getGrossCompensation() != null) {
            gross = Base64.getEncoder().encodeToString(appraisalUpdateRequest.getGrossCompensation().getBytes(StandardCharsets.UTF_8));
            appraisalUpdateRequest.setGrossCompensation(gross);
        }
        if (appraisalUpdateRequest.getSalaryHikePersentage() != null) {
            hike = Base64.getEncoder().encodeToString(appraisalUpdateRequest.getSalaryHikePersentage().getBytes(StandardCharsets.UTF_8));
            appraisalUpdateRequest.setSalaryHikePersentage(hike);
        }

        return appraisalUpdateRequest;
    }

}