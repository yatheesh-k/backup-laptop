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
public class BackgroundEntity implements Entity {

    private String backgroundId;
    private String companyId;
    private String employeeId;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String companyName;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String emailId;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String contactNo;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String date;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String type;
}