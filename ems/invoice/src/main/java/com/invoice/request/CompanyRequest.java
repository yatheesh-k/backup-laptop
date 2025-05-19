package com.invoice.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyRequest {

    @NotBlank(message = "{userName.notnull.message}")
    @Size(min = 2, max = 100, message = "{userName.size.message}")
    private String userName;

    @NotBlank(message = "{companyEmail.notnull.message}")
    @Email(message = "{companyEmail.message}")
    private String companyEmail;

    @NotBlank(message = "{password.notnull.message}")
    @Size(min = 8, max = 100, message = "{password.size.message}")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", message = "{password.pattern.message}")
    private String password;

    @NotBlank(message = "{phone.notnull.message}")
    @Pattern(regexp = "^\\d{10}$", message = "{phone.format}")
    private String phone;

    @NotBlank(message = "{companyName.notnull.message}")
    @Size(min = 2, max = 100, message = "{companyName.size.message}")
    private String companyName;

    @NotBlank(message = "{pan.notnull.message}")
    @Pattern(regexp = "^[A-Z]{5}[0-9]{4}[A-Z]{1}$", message = "{pan.format}")
    private String pan;

    @NotBlank(message = "{gstNumber.notnull.message}")
    @Pattern(regexp = "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$", message = "{gstNumber.format}")
    private String gstNo;

    @NotBlank(message = "{gender.notnull.message}")
    private String gender;

    @NotBlank(message = "{stampImage.notnull.message}")
    private String stampImage;

    @NotBlank(message = "{accountNumber.notnull.message}")
    private String accountNumber;

    @NotBlank(message = "{bankName.notnull.message}")
    private String bankName;

    @NotBlank(message = "{branch.notnull.message}")
    private String branch;

    @NotBlank(message = "{ifscCode.notnull.message}")
    private String ifscCode;

    @NotBlank(message = "{address.notnull.message}")
    @Size(max = 255, message = "{address.size.message}")
    private String address;

    @NotBlank(message = "{state.notnull.message}")
    private String state;

    @NotBlank(message = "{serviceName.notnull.message}")
    private String serviceName;

    private String imageFile;

    private String place;

    private String accountType;
}
