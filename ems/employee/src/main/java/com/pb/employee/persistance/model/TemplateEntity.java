package com.pb.employee.persistance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TemplateEntity implements Entity  {

    private String id;
    private String companyId;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String payslipTemplateNo;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String experienceTemplateNo;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String relievingTemplateNo;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String appraisalTemplateNo;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String offerLetterTemplateNo;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String internshipTemplateNo;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String type;
}
