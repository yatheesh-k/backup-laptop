package com.ems.accountant.exception;

public enum ErrorMessageKey {

    /**
     * All storage device error keys
     */

    INVALID_CREDENTIALS("invalid.credentials"),
    INVALID_RESOURCE_TYPE("invalid.resource"),
    UNABLE_TO_SEARCH("unable.to.search"),
    FAILED_TO_DELETE("failed.to.delete"),
    UNABLE_SAVE("unable.to.save"),
    EXCEPTION_OCCURRED("exception.occurred"),
    UNABLE_SAVE_EMPLOYEE_PF("unable.to.save.employee.pf"),
    INVALID_FILE_TYPE("invalid.file.type"),
    EMPTY_FILE("empty.file"),
    COMPANY_NOT_EXIST("company.not.exist"),
    EMPLOYEE_NOT_FOUND("employee.not.found"),
    EMPLOYEE_PF_ALREADY_EXISTS("employee.pf.already.exists"),
    EMPLOYEE_PF_NOT_FOUND("employee.pf.not.found"),;

    private final String key;

    ErrorMessageKey(String keyVal) {
        key = keyVal;
    }

    public String getStatusCode() {
        return key;
    }

    @Override
    public String toString() {
        return key;
    }
}