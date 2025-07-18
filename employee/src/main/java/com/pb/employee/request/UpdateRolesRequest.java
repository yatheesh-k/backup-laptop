package com.pb.employee.request;

import com.pb.employee.validations.RoleValidation;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRolesRequest {

    @RoleValidation
    public List< String> roles;
}
