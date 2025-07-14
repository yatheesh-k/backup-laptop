package com.pb.employee.validations;

import jakarta.validation.Constraint;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RUNTIME)
@Constraint(validatedBy = UserTypeValidationImpl.class)
public @interface UserTypeValidation {
    String message() default "The User type doesn't match!";
    Class<?>[] groups() default {};
    Class<? extends String>[] payload() default {};
}
