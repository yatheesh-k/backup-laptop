package com.ems.accountant.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = MonthValidationImpl.class)
@Documented
public @interface MonthValidation {
    String message() default "Invalid month. It must be a valid full month name (e.g., 'January').";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
