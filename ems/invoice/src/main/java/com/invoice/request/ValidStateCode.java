package com.invoice.request;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = StateCodeValidator.class)
@Target({ElementType.TYPE}) // Apply to the class
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidStateCode {
    String message() default "{invalid.stateCode}";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}


