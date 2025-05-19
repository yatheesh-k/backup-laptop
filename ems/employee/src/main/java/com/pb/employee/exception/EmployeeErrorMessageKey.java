package com.pb.employee.exception;

public enum EmployeeErrorMessageKey {

    /**
     * All storage device error keys
     */

    INVALID_CREDENTIALS("invalid.credentials"),
    EMPLOYEE_ID_IS_NULL("employee.id.isnull"),
    INVALID_RESOURCE_TYPE("invalid.resource"),
    COMPANY_ALREADY_EXISTS("company.already.exists"),
    COMPANY_SHORT_NAME_ALREADY_EXISTS("company.shortname.already.exists"),
    UNABLE_SAVE_COMPANY("unable.save.company"),
    UNABLE_DELETE_COMPANY("unable.delete.company"),
    UNABLE_GET_COMPANY("unable.get.company"),
    UNABLE_UPLOAD_IMAGE("unable.upload.image"),
    UNABLE_TO_CREATE_COMPANY("unable.to.create.index"),
    INVALID_COMPANY("invalid.company"),
    INVALID_EMPLOYEE("invalid.employee"),
    INVALID_PASSWORD("invalid.password"),
    EMPLOYEE_ID_ALREADY_EXISTS("employee.id.already.exists"),
    EMPLOYEE_EMAILID_ALREADY_EXISTS("employee.emailid.already.exists"),
    UNABLE_SAVE_EMPLOYEE("unable.save.employee"),
    UNABLE_DELETE_EMPLOYEE("unable.delete.employee"),
    UNABLE_SAVE_BANK_DETAILS("unable.save.bank.details"),
    UNABLE_GET_EMPLOYEES("unable.get.employee"),
    DEPARTMENT_ID_ALREADY_EXISTS("department.id.already.exists"),
    INVALID_DEPARTMENT("invalid.department"),
    UNABLE_DELETE_DEPARTMENT("unable.delete.department"),
    UNABLE_SAVE_DEPARTMENT("unable.save.department"),
    UNABLE_GET_DEPARTMENT("unable.get.department"),
    DESIGNATION_ID_ALREADY_EXISTS("designation.id.already.exists"),
    INVALID_DESIGNATION("invalid.designation"),
    UNABLE_DELETE_DESIGNATION("unable.delete.designation"),
    UNABLE_SAVE_DESIGNATION("unable.save.designation"),
    UNABLE_GET_DESIGNATION("unable.get.designation"),
    UNABLE_TO_SAVE_SALARY("unable.save.salary"),
    UNABLE_TO_SAVE_ATTENDANCE("unable.save.attendance"),
    UNABLE_GET_EMPLOYEES_SALARY("unable.get.employee.salary"),
    ATTENDANCE_ALREADY_EXISTS("attendance.already.exists"),
    INVALID_FORMAT("invalid.format"),
    FAILED_TO_PROCESS("failed.process"),
    EMPTY_FILE("file.empty"),
    EMPLOYEE_PAYSLIP_ALREADY_EXISTS("employee.payslip.already.exist"),
    EMPLOYEE_NOT_MATCHING("employee.not.matching"),
    UNABLE_GET_EMPLOYEES_PAYSLIP("unable.get.employee.payslip"),
    UNABLE_TO_GET_ATTENDANCE("unable.get.attendance"),
    UNABLE_GET_EMPLOYEES_ATTENDANCE("unable.employee.attendance"),
    UNABLE_TO_GENERATE_PAYSLIP("unable.to.generate.payslip"),
    UNABLE_SAVE_EMPLOYEE_ATTENDANCE("unable.to.save.attendance"),
    FAILED_TO_CREATE("failed.create"),
    EXCEPTION_OCCURRED("exception.occurred"),
    NUMBER_EXCEPTION("number.exception"),
    UNABLE_TO_SEARCH("unable.to.search"),
    FAILED_TO_DELETE("failed.to.delete"),
    EMPLOYEE_NOT_FOUND("employee.not.found"),
    EMPLOYEE_INACTIVE("employee.inactive"),
    INVALID_MONTH_NAME("invalid.month"),
    INVALID_NO_OF_WORKING_DAYS("invalid.working.days"),
    SALARY_ALREADY_EXIST("salary.already.exist"),
    SALARY_INACTIVE("salary.inactive"),
    INVALID_EMPLOYEE_DETAILS("invalid.employee.details"),
    INVALID_ATTENDANCE_DATA("invalid.attendance.data"),
    INVALID_YEAR("invalid.year"),
    NO_ATTENDANCE_FOUND("attendance.not.found"),
    DEPARTMENT_IS_EXIST_EMPLOYEE("department.exist.in.employee"),
    DESIGNATION_IS_EXIST_EMPLOYEE("designation.exist.in.employee"),
    EMPLOYEE_DATA_EXIST("employee.date.exist"),
    INVALID_TEMPLATE_NUMBER("template.number"),
    ERROR_PROCESSING_TEMPLATE("template.error"),
    UNABLE_GET_SALARY_STRUCTURE("unable.get.salary.structure"),
    UNABLE_SAVE_COMPANY_SALARY("unable.save.company.salary"),
    COMPANY_SALARY_ALREADY_EXIST("company.salary.already.exist"),
    INVALID_NO_DAYS("invalid.no.days"),
    COMPANY_CIN_NO_REQUIRED("company.cin.no.required"),
    COMPANY_REG_NO_REQUIRED("company.reg.no.required"),
    EMPLOYEE_DETAILS_MISMATCH("employee.details"),
    INVALID_ATTENDANCE_DATE("invalid.date"),
    COMPANY_NOT_EXIST("company.not.exist"),
    COMPANY_SALARY_NOT_FOUND("company.salary.not.found"),
    UNABLE_DELETE_ATTENDANCE("unable.delete.attendance"),
    UNABLE_UPDATE_ATTENDANCE("unable.update.attendance"),
    UNABLE_GET_EMPLOYEES_SALARY_STRUCTURE("unable.get.employee.salary.structure"),
    EMPLOYEE_COMPANY_SALARY_INACTIVE("employee.company.salary.inactive"),
    COMPANY_DATA_EXIST("company.data.exist"),
    RELIEVING_ALREADY_EXIST("relieving.already.exist"),
    IMAGE_NOT_LOADED("image.not.loaded"),
    UNABLE_GET_RELIEVING("unable.get.relieving"),
    RELIEVING_NOT_EXIST("relieving.not.exist"),
    UNABLE_SAVE_TEMPLATE("unable.save.template"),
    TEMPLATE_EXIST("template.already.exists"),
    UNABLE_TO_GET_TEMPLATE("unable.template"),
    INVALID_RELIVING("invalid.relieving"),
    INVALID_HIRING_DATE("invalid.hiring"),
    EXPERIENCE_DATE_NOT_VALID("experience.not.valid"),
    INVALID_IMAGE("invalid.image"),
    EMPTY_LOGO("company.logo"),
    BANK_ALREADY_EXISTS("bank.already.exists"),
    UNABLE_GET_BANK_DETAILS("unable.bank.details"),
    INVALID_BANK_DETAILS("invalid.bank.details"),
    UNABLE_DELETE_BANK_DETAILS("unable.delete.bank"),
    UNABLE_SAVE_BACKGROUND_DETAILS("unable.save.background.details"),
    BACKGROUND_ALREADY_EXISTS("background.already.exists"),
    UNABLE_GET_BACKGROUND_DETAILS("unable.background.details"),
    INVALID_BACKGROUND_DETAILS("invalid.background.details"),
    INVALID_EMPLOYEE_TYPE("invalid.employee.type"),
    NO_CHANGE_IN_BANK_DETAILS("nochange.bank.details"),
    NO_CHANGE_IN_WORKING_DAYS("nochange.working.days"),
    PAYSLIP_ALREADY_GENERATED("payslip.already.exist"),
    INVALID_DATES("invalid.dates");

    private final String key;

    EmployeeErrorMessageKey(String keyVal) {
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