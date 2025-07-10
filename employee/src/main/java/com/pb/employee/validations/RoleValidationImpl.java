package com.pb.employee.validations;

import com.pb.employee.persistance.model.RoleType;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class RoleValidationImpl implements ConstraintValidator<RoleValidation, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return RoleType.exists(value);
    }
}
