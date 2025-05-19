package com.pb.employee.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateRequest {

    @NotBlank(message = "{companyId.required}")
    private String companyId;
    private String payslipTemplateNo;
    private String experienceTemplateNo;
    private String relievingTemplateNo;
    private String appraisalTemplateNo;
    private String offerLetterTemplateNo;
    private String internshipTemplateNo;
}
