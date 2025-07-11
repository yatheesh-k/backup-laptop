package com.pb.employee.persistance.model;

import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.util.APIConstants;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;

@AllArgsConstructor
@Getter
public enum UserType {

    HRM(APIConstants.HRM),
    ACCOUNTANT(APIConstants.ACCOUNTANT),;


    private final String value;

    public String value() {
        return value;
    }

    public static UserType value(String value) throws Exception {
        if(!StringUtils.isNotEmpty(value))
            throw new EmployeeException(ErrorMessageHandler
                    .getMessage(EmployeeErrorMessageKey.INVALID_USER_TYPE), HttpStatus.BAD_REQUEST);

        for (UserType type : values()) {
            if (type.value().equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new EmployeeException(String.format(ErrorMessageHandler
                .getMessage(EmployeeErrorMessageKey.INVALID_USER_TYPE), value), HttpStatus.BAD_REQUEST);
    }

    public static boolean exists(String value) {
        try {
            value(value);
        } catch (Exception e) {
            return false;
        }
        return true;
    }

}
