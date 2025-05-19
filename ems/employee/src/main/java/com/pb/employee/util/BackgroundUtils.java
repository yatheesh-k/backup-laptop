package com.pb.employee.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.persistance.model.BackgroundEntity;
import com.pb.employee.persistance.model.BankEntity;
import com.pb.employee.persistance.model.Entity;
import com.pb.employee.request.BackgroundRequest;
import com.pb.employee.request.BankRequest;
import com.pb.employee.request.BankUpdateRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Base64;

@Slf4j
@Component
public class BackgroundUtils {


    public static BackgroundEntity maskEmployeeBackgroundProperties(BackgroundRequest backgroundRequest, String resourceId, String companyId, String employeeId) {
        // Declare masked variables corresponding to BackgroundRequest fields
        String companyName = null, emailId = null, contactNo = null, date = null;

        // Masking the fields based on the BackgroundRequest
        if (backgroundRequest.getCompanyName() != null) {
            companyName = Base64.getEncoder().encodeToString(backgroundRequest.getCompanyName().getBytes());
        }
        if (backgroundRequest.getEmailId() != null) {
            emailId = Base64.getEncoder().encodeToString(backgroundRequest.getEmailId().getBytes());
        }
        if (backgroundRequest.getContactNo() != null) {
            contactNo = Base64.getEncoder().encodeToString(backgroundRequest.getContactNo().getBytes());
        }
        if (backgroundRequest.getDate() != null) {
            date = Base64.getEncoder().encodeToString(backgroundRequest.getDate().getBytes());
        }

        // Create an ObjectMapper for converting the BackgroundRequest to a BankEntity
        ObjectMapper objectMapper = new ObjectMapper();

        // Convert BackgroundRequest to BankEntity
        BackgroundEntity bankEntity = objectMapper.convertValue(backgroundRequest, BackgroundEntity.class);

        // Set the resource-specific and company-specific data in the BankEntity
        bankEntity.setBackgroundId(resourceId); // Set the resource ID
        bankEntity.setCompanyId(companyId); // Associate with the company
        bankEntity.setEmployeeId(employeeId); // Associate with the employee
        bankEntity.setCompanyName(companyName); // Set the masked company name
        bankEntity.setEmailId(emailId); // Set the masked email ID
        bankEntity.setContactNo(contactNo); // Set the masked contact number
        bankEntity.setDate(date); // Set the masked date

        // Set the entity type (assuming the type is "BANK")
        bankEntity.setType(Constants.BACKGROUND);

        // Return the fully populated and masked BankEntity
        return bankEntity;
    }



    public static Entity maskCompanyBankUpdateProperties(BankUpdateRequest bankUpdateRequest, String bankId, String companyId) {

        // Declare masked variables
        String  ifscCode = null, address = null, accountType = null,branch =null;

        if (bankUpdateRequest.getIfscCode() != null) {
            ifscCode = Base64.getEncoder().encodeToString(bankUpdateRequest.getIfscCode().getBytes());
        }
        if (bankUpdateRequest.getAddress() != null) {
            address = Base64.getEncoder().encodeToString(bankUpdateRequest.getAddress().getBytes());
        }
        if (bankUpdateRequest.getBranch() != null) {
            // Masking the branch name as an example
            branch = Base64.getEncoder().encodeToString(bankUpdateRequest.getBranch().getBytes());
        }
        if (bankUpdateRequest.getAccountType() != null) {
            // Masking the branch name as an example
            accountType = Base64.getEncoder().encodeToString(bankUpdateRequest.getAccountType().getBytes());
        }

        ObjectMapper objectMapper = new ObjectMapper();

        BankEntity bankEntity = objectMapper.convertValue(bankUpdateRequest, BankEntity.class);
        bankEntity.setIfscCode(ifscCode); // Set the masked IFSC code
        bankEntity.setBranch(branch); // Set the masked IFSC code
        bankEntity.setAccountType(accountType); // Set the masked IFSC code
        bankEntity.setAddress(address); // Set the masked address (or branch/state if needed)
        bankEntity.setType(Constants.BANK); // Assuming the type is "BANK"

        // Add any other fields that need masking and setting...

        return bankEntity;
    }

    public static BackgroundEntity unmaskBackgroundProperties(BackgroundEntity backgroundEntity) {
        // Declare unmasked variables corresponding to the BackgroundEntity fields
        String companyName = null, emailId = null, contactNo = null, date = null;

        // Unmasking the properties by decoding the Base64 encoded values
        if (backgroundEntity.getCompanyName() != null) {
            companyName = new String(Base64.getDecoder().decode(backgroundEntity.getCompanyName()));
        }
        if (backgroundEntity.getEmailId() != null) {
            emailId = new String(Base64.getDecoder().decode(backgroundEntity.getEmailId()));
        }
        if (backgroundEntity.getContactNo() != null) {
            contactNo = new String(Base64.getDecoder().decode(backgroundEntity.getContactNo()));
        }
        if (backgroundEntity.getDate() != null) {
            date = new String(Base64.getDecoder().decode(backgroundEntity.getDate()));
        }

        // Now, set the unmasked properties back to the BackgroundEntity object
        backgroundEntity.setCompanyName(companyName);
        backgroundEntity.setEmailId(emailId);
        backgroundEntity.setContactNo(contactNo);
        backgroundEntity.setDate(date);

        // Return the updated BackgroundEntity with unmasked data
        return backgroundEntity;
    }

}