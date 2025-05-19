package com.pb.employee.request;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.pb.employee.persistance.model.Entity;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class OfferLetterRequest {


    @Schema(example = "yyyy-mm-dd")
    @Pattern(regexp =  "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$", message = "{offerDate.format}")
    @NotBlank(message = "{offerDate.notnull.message}")
    private String offerDate;

    @Schema(example = "referenceNo")
    private String referenceNo;

    @Schema(example = "employeeName")
    @Pattern(regexp = "^(?!\\s)(.*?)(?<!\\s)$", message = "{firstname.format}")
    @Size(min = 1, max = 100, message = "{firstName.size.message}")
    private String employeeName;

    @Schema(example = "employeeFatherName")
    @Pattern(regexp = "^(?!\\s)(.*?)(?<!\\s)$",
            message = "{fathername.format}")
    @Size(min = 1, max = 100, message = "{firstName.size.message}")
    private String employeeFatherName;

    @Schema(example = "address")
    @Pattern(regexp = "^(?!\\s)(.*?)(?<!\\s)$",
            message = "{invalid.location.format}")
    @Size(min = 1, max = 200, message = "{location.notnull.message}")
    private String employeeAddress;

    @Schema(example = "contactNo")
    @NotNull(message = "{mobileNo.notnull.message}")
    @Pattern(regexp ="^\\+91 [6-9]\\d{9}$", message = "{invalid.mobileNo}")
    private String employeeContactNo;

    @Schema(example = "yyyy-mm-dd")
    @Pattern(regexp =  "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$", message = "{joining.format}")
    @NotBlank(message = "{joining.notnull.message}")
    private String joiningDate;

    @Schema(example = "jobLocation")
    @Pattern(regexp = "^(?!\\s)(.*?)(?<!\\s)$", message = "{invalid.location.format}")
    @Size(min = 1, max = 200, message = "{location.notnull.message}")
    private String jobLocation;

    @Schema(example = "salaryPackage")
    @Pattern(regexp = "^\\d{5,20}$", message = "{grossAmount.format}")
    private String salaryPackage;

    private String companyId;
    private String salaryConfigurationId;

    @Schema(example = "designation")
    @Pattern(regexp =  "^(?:[A-Z][a-z]+(?: [A-Z][a-z]+)*|[A-Z]{2,} [A-Z][a-z]+|[A-Z]+(?: [A-Z]+)*|[A-Z]+(?:/[A-Z]+)*)$",
            message = "{invalid.position.format}")
    private String designation;

    @Schema(example = "department")
    @Pattern(regexp =  "^(?:[A-Z][a-z]+(?: [A-Z][a-z]+)*|[A-Z]{2,} [A-Z][a-z]+|[A-Z]+(?: [A-Z]+)*|[A-Z]+(?:/[A-Z]+)*)$",
            message = "{department.format}")
    private String department;

}