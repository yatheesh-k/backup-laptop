package com.pb.employee.validations;

import com.pb.employee.persistance.model.RoleType;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.List;

public class RoleValidationImpl implements ConstraintValidator<RoleValidation, List<String>> {
    @Override
    public boolean isValid(List<String> value, ConstraintValidatorContext context) {
        return value != null && value.stream().allMatch(RoleType::exists);
    }
}
