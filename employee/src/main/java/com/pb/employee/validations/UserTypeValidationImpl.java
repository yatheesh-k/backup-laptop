package com.pb.employee.validations;

import com.pb.employee.persistance.model.RoleType;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.List;

public class UserTypeValidationImpl implements ConstraintValidator<UserTypeValidation, List<String>> {
    @Override
    public boolean isValid(List<String> value, ConstraintValidatorContext context) {
        return RoleType.exists(value);
    }
}
