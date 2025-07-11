package com.pb.employee.validations;

import com.pb.employee.persistance.model.UserType;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class UserTypeValidationImpl implements ConstraintValidator<UserTypeValidation, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return UserType.exists(value);
    }
}
