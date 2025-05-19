package com.pb.employee.persistance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SalaryConfigurationEntity implements Entity{

    private String id;
    private Map<String, String> allowances;
    private Map<String, String> deductions;
    private String status;
    private String type;
}
