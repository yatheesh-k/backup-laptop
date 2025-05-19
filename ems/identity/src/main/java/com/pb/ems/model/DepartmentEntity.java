package com.pb.ems.model;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.pb.ems.persistance.Entity;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DepartmentEntity implements Entity {
    private String id;
    private String name;
    private String type;

}