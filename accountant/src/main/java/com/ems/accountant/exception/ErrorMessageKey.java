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
    EMPLOYEE_PF_NOT_FOUND("employee.pf.not.found"),
    UNABLE_SAVE_EMPLOYEE_PT("unable.to.save.employee.pt"),
    EMPLOYEE_PT_NOT_FOUND("employee.pt.not.found"),
    PF_RESPONSE_ALREADY_EXISTS("pf.response.already.exists"),
    UNABLE_SAVE_PF_RESPONSE("unable.to.save.pf.response"),
    PF_RESPONSE_NOT_FOUND("pf.response.not.found"),
    UNABLE_FETCH_PF_RESPONSE("unable.to.fetch.pf.response"),
    NO_CHANGES_DETECTED("no.changes.detected"),
    UNABLE_UPDATE_PF_RESPONSE("unable.to.update.pf.response"),
    UNABLE_DELETE_PF_RESPONSE("unable.to.delete.pf.response"),
    UNABLE_SAVE_PT_RESPONSE("unable.to.save.pt.response"),
    PT_RESPONSE_ALREADY_EXISTS("pt.response.already.exists"),
    PT_RESPONSE_NOT_FOUND("pt.response.not.found"),
    UNABLE_DELETE_PT_RESPONSE("unable.delete.pt.response"),
    UNABLE_UPDATE_PT_RESPONSE("unable.update.pt.response"),
    UNABLE_FETCH_PT_RESPONSE("unable.fetch.pt.response");


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