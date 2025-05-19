package com.pb.employee.persistance.model;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)  // This will ignore unknown properties like "state"
public class BankEntity implements Entity {

    private String bankId;
    private String companyId;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String accountNumber;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String accountType;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String bankName;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String branch;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String ifscCode;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String address;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String type;
}