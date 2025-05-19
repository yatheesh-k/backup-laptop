package com.pb.employee.model;

import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;

@AllArgsConstructor
@Getter
public enum ResourceType {

    EMS_ADMIN("ems_admin"),
    COMPANY("company"),
    EMPLOYEE("employee"),
    DEPARTMENT("department"),
    DESIGNATION("designation"),
    ATTENDANCE("attendance"),
    SALARY("salary"),
    PAYSLIP("payslip"),
    SALARY_STRUCTURE("salary_structure"),
    RELIEVING("relieving"),
    TEMPLATE("template"),
    BANK("bank_details"),
    BACKGROUND("background_details");



    private final String value;
    public String value() {return this.value;}

    public static ResourceType fromValue(String value) throws EmployeeException {
        if(StringUtils.isBlank(value))
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_RESOURCE_TYPE), HttpStatus.BAD_REQUEST);

        for (ResourceType type : values()) {
            if (type.name().equalsIgnoreCase(value) || type.value().equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_RESOURCE_TYPE), value), HttpStatus.BAD_REQUEST);
    }
}
