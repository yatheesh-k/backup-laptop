package com.pb.employee.exception;


import com.pb.employee.config.AppEnvironment;
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

    public static String  getMessage(EmployeeErrorMessageKey key) {
        return AppEnvironment.environment.getProperty(key.toString());
    }
    public static String  getMessage(EmployeeErrorMessageKey key, String defaultValue) {
        return AppEnvironment.environment.getProperty(key.toString(),defaultValue);
    }
}
