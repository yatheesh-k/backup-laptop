package com.pb.employee.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceLetterRequest {

    private String companyName;
    private String employeeId;
    private String Date;
    private List<String> content;

}
