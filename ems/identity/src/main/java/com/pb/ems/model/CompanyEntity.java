package com.pb.ems.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@Builder
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CompanyEntity {

    private String id;
    private String companyName;
    private String emailId;
    private String password;
    private String companyAddress;
    private String companyRegNo;
    private String mobileNo;
    private String landNo;
    private String gstNo;
    private String panNo;
    private String name;
    private String personalMailId;
    private String personalMobileNo;
    private String address;
    private String imageFile;
    private String companyType;
    private String companyBranch;

    private String cinNo;
    private String pfPercentage;
    private String travelAllowance;
    private String specialAllowance;
    private String hraPercentage;
    private String shortName;
    private String type;

}
