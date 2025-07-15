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
    CUSTOMER_GST_NOT_FOUND("customer.gst.not.found"),
    UNABLE_SAVE_EMPLOYEE_PT("unable.to.save.employee.pt"),
    EMPLOYEE_PT_NOT_FOUND("employee.pt.not.found"),
    PF_RESPONSE_ALREADY_EXISTS("pf.response.already.exists"),
    UNABLE_SAVE_PF_RESPONSE("unable.to.save.pf.response"),
    PF_RESPONSE_NOT_FOUND("pf.response.not.found"),
    UNABLE_FETCH_PF_RESPONSE("unable.to.fetch.pf.response"),
    NO_CHANGES_DETECTED("no.changes.detected"),
    UNABLE_UPDATE_PF_RESPONSE("unable.to.update.pf.response"),
    UNABLE_DELETE_PF_RESPONSE("unable.to.delete.pf.response"),
    GST_ACCOUNT_ALREADY_EXIST("gst.account.already.exist"),
    GST_ACCOUNT_NOT_FOUND("gst.account.not.found"),
    UNABLE_DELETE("unable.to.delete"),
    UNABLE_SAVE_PT_RESPONSE("unable.to.save.pt.response"),
    PT_RESPONSE_ALREADY_EXISTS("pt.response.already.exists"),
    PT_RESPONSE_NOT_FOUND("pt.response.not.found"),
    UNABLE_DELETE_PT_RESPONSE("unable.delete.pt.response"),
    UNABLE_UPDATE_PT_RESPONSE("unable.update.pt.response"),
    UNABLE_FETCH_PT_RESPONSE("unable.fetch.pt.response"),
    TDS_RESPONSE_ALREADY_EXISTS("tds.response.already.exists"),
    UNABLE_SAVE_TDS_RESPONSE("unable.to.save.tds.response"),
    TDS_RESPONSE_NOT_FOUND("tds.response.not.found"),
    UNABLE_FETCH_TDS_RESPONSE("unable.to.fetch.tds.response"),
    UNABLE_UPDATE_TDS_RESPONSE("unable.to.update.tds.response"),
    UNABLE_DELETE_TDS_RESPONSE("unable.to.delete.tds.response"),
    PF_RECEIPTS_ALREADY_EXISTS("pf.receipts.already.exists"),
    PF_RECEIPTS_FILE_EMPTY("pf.receipts.file.empty"),
    UNABLE_SAVE_PF_RECEIPTS("unable.to.save.pf.receipts"),
    PF_RECEIPTS_NOT_FOUND("pf.receipts.not.found"),
    UNABLE_DELETE_PF_RECEIPTS("unable.to.delete.pf.receipts"),
    PT_RECEIPTS_ALREADY_EXISTS("pt.receipts.already.exists"),
    PT_RECEIPTS_FILE_EMPTY("pt.receipts.file.empty"),
    UNABLE_SAVE_PT_RECEIPTS("unable.to.save.pt.receipts"),
    PT_RECEIPTS_NOT_FOUND("pt.receipts.not.found"),
    UNABLE_DELETE_PT_RECEIPTS("unable.to.delete.pt.receipts"),
    GST_RESPONSE_ALREADY_EXISTS("gst.response.already.exists"),
    UNABLE_SAVE_GST_RESPONSE("unable.to.save.gst.response"),
    GST_RESPONSE_NOT_FOUND("gst.response.not.found"),
    UNABLE_FETCH_GST_RESPONSE("unable.to.fetch.gst.response"),
    UNABLE_UPDATE_GST_RESPONSE("unable.to.update.gst.response"),
    UNABLE_DELETE_GST_RESPONSE("unable.to.delete.gst.response"),
    INVALID_SALARY_FORMAT("invalid.salary.format"),
    UNABLE_SAVE_EMPLOYEE_TDS("unable.to.save.employee.tds"),
    EMPLOYEE_TDS_NOT_FOUND("employee.tds.not.found");

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