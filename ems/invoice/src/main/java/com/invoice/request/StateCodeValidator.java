package com.invoice.request;

import com.invoice.util.Constants;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class StateCodeValidator implements ConstraintValidator<ValidStateCode, CustomerRequest> {

    private static final String GST_REGEX = "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$";

    @Value( value = "${invalid.state.code.mismatch}")
    private String stateCodeMismatchMessage;

    @Value(value = "${invalid.state.code.format}")
    private String stateCodeFormatMessage;

    @Override
    public boolean isValid(CustomerRequest customerRequest, ConstraintValidatorContext context) {
        if (customerRequest == null) {
            return true; // No validation required if the object is null
        }
        String customerGstNo = customerRequest.getCustomerGstNo();
        String stateCode = customerRequest.getStateCode();

        if (customerGstNo != null && customerGstNo.matches(GST_REGEX)) {
            String extractedStateCode = customerGstNo.substring(0, 2);

            if (stateCode == null || !stateCode.equals(extractedStateCode)) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(stateCodeMismatchMessage)
                        .addPropertyNode("stateCode")
                        .addConstraintViolation();
                return false;
            }
        } else {
            if (stateCode != null && !stateCode.matches("^[0-9]{2}$")) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(stateCodeFormatMessage)
                        .addPropertyNode("stateCode")
                        .addConstraintViolation();
                return false;
            }
        }
        return true;
    }
}
