package com.pb.employee.request;

import io.micrometer.common.lang.Nullable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {

    @NotBlank(message = "{customerName.notnull.message}")
    @Size(min = 2, max = 100, message = "{customerName.size.message}")
    private String customerName;

    @NotBlank(message = "{email.notnull.message}")
    @Email(message = "{email.message}")
    private String email;

    @NotBlank(message = "{mobileNumber.notnull.message}")
    @Pattern(regexp = "^(\\+\\d{1,3}[- ]?)?\\d{10,15}$", message = "{mobileNumber.format}")
    private String mobileNumber;

    @NotBlank(message = "{address.notnull.message}")
    @Size(max = 255, message = "{address.size.message}")
    private String address;

    @NotBlank(message = "{state.notnull.message}")
    private String state;

    @NotBlank(message = "{city.notnull.message}")
    private String city;

    @NotBlank(message = "{pinCode.notnull.message}")
    @Pattern(regexp = "^[A-Za-z0-9 \\-]{3,10}$", message = "{pinCode.format}")
    private String pinCode;

    @Pattern(regexp = "^(Active|InActive)$", message = "{status.format}")
    @NotBlank(message = "{status.notnull.message}")
    private String status;

    @Nullable
    @Pattern(regexp = "^$|[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$",
            message = "{customerGstNo.invalid}")
    private String customerGstNo;

    @Nullable
    private String stateCode;

}