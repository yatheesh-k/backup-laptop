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
public class CompanyEntity {

    private String id;
    private String gstNo;
    private String panNo;
    private String companyName;
    private String companyAddress;
    private String imageFile;
    private String companyType;
    private String companyBranch;
    private String cinNo;
    private String stampImage;
    private String shortName;
    private String mobileNo;
    private String emailId;

}