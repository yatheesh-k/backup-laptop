package com.pb.ems.exception;


import com.pb.ems.config.AppEnvironment;
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

    public static String  getMessage(IdentityErrorMessageKey key) {
        return AppEnvironment.environment.getProperty(key.toString());
    }
    public static String  getMessage(IdentityErrorMessageKey key, String defaultValue) {
        return AppEnvironment.environment.getProperty(key.toString(),defaultValue);
    }
}
