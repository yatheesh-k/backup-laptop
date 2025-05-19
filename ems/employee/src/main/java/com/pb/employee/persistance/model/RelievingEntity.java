package com.pb.employee.persistance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class RelievingEntity implements Entity{

    private String id;
    private String employeeId;
    private String relievingDate;
    private String resignationDate;
    private String noticePeriod;
    private String type;
}
