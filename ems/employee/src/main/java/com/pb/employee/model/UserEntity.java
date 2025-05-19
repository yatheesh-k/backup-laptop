package com.pb.employee.model;

import com.pb.employee.persistance.model.Entity;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class UserEntity implements Entity {

    private String resourceId;
    private String type;
    private String username;
    private String password;
    private String companyId;
}
