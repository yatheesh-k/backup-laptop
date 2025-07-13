package com.ems.accountant.exception;


import com.ems.accountant.config.AppEnvironment;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;

@Getter
@Setter
@NoArgsConstructor
public class ErrorMessageHandler {
    @Autowired
    private static Environment environment;

    public static String  getMessage(ErrorMessageKey key) {
        return AppEnvironment.environment.getProperty(key.toString());
    }
    public static String  getMessage(ErrorMessageKey key, String defaultValue) {
        return AppEnvironment.environment.getProperty(key.toString(),defaultValue);
    }
}
