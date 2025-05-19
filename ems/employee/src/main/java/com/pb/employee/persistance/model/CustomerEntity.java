package com.pb.employee.persistance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import nonapi.io.github.classgraph.json.Id;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CustomerEntity {

    @Id
    private String customerId;

    private String companyId;
    private String customerName;
    private String address;
    private String state;
    private String city;
    private String pinCode;
    private String stateCode;
    private String mobileNumber;
    private String email;
    private String customerGstNo;
    private String status;

}
