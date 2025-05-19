package com.invoice.model;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BankEntity  {

    private String bankId;
    private String accountNumber;
    private String accountType;
    private String bankName;
    private String branch;
    private String ifscCode;
    private String address;
    private String type;
}