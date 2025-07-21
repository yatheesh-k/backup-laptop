package com.pb.employee.request;

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
public class EmployeeReqPayload {

    private String companyId;
    private String firstName;
    private String lastName;
    private String emailId;
    private String mobileNo;
    private String uanNo;
    private String panNo;
    private String aadhaarId;
    private String pfNo;

}
