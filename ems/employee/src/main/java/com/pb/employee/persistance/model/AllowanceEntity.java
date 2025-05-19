package com.pb.employee.persistance.model;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AllowanceEntity implements Entity{


    private String travelAllowance;
    private String pfContributionEmployer;
    private String hra;
    private String specialAllowance;
    private String otherAllowances;

}