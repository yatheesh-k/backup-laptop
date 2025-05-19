package com.invoice.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.persistence.Entity;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@Entity
@Table(name = "customer")
public class CustomerModel {

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