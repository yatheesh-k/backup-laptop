package com.invoice.exception;

import com.invoice.config.AppEnvironment;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;

@Getter
@Setter
@NoArgsConstructor
public class InvoiceErrorMessageHandler {
    @Autowired
    private static Environment environment;
    public static String getMessage(InvoiceErrorMessageKey key) {
        return AppEnvironment.environment.getProperty(key.toString());
    }

    public static String getMessage(InvoiceErrorMessageKey key, String defaultValue) {
        return AppEnvironment.environment.getProperty(key.toString(), defaultValue);
    }
}

