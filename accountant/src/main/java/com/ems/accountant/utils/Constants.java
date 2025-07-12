package com.ems.accountant.utils;



import org.springframework.stereotype.Component;


@Component
public class Constants {

    public static final String REMOTE_SERVICE_UNAVAILABLE = "Remote service is not available at the moment";
    public static final String REQUEST_PAYLOAD_INVALID = "Request payload is not valid";
    public static final String REQUEST_UNAUTHORIZED = "Request is unauthorized";
    public static final String REQUEST_RESOURCE_DUPLICATE = "Resource already exists";
    public static final String REQUEST_RESOURCE_NOT_FOUND = "Resource not found";
    public static final String REQUEST_OPERATION_INVALID = "This operation is not allowed";
    public static final String REQUEST_UNABLE_TO_PROCESS = "Remote service is not able to process the request at the moment";
    public static final String RESOURCE_ID = "ResourceId";
    public static final String INDEX_EMS = "ems";
    public static final String ID = "id";
    public static final String SHORT_NAME = "shortName";
    public static final String TYPE = "type";
    public static final String COMPANY = "company";
    public static final String DEFAULT = "default";
    public static final Object SUCCESS = "success";
    public static final String EXCEL_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    public static final String EMPLOYEE_ACCOUNT = "employee_account";
    public static final String UAN_NUMBER = "uanNo";
    public static final String MISSED_COMPANY_EMPLOYEES = "Company Employees Who are not in the Sheet";
    public static final String NOT_COMPANY_EMPLOYEES = "Employees Not existed in company";
    public static final String EMPLOYEE = "employee";
    public static final String PF_MISMATCH_EMPLOYEES = "PF Mismatch Employees";
    public static final String AUTH_KEY = "Authorization";
    public static final String COMPANY_ID = "companyId";
    public static final String MONTH = "month";
    public static final String YEAR = "year";
    public static final String COMPANY_ADMIN = "company_admin";
    public static final String EMS_ADMIN = "ems_admin";
    public static final String ACCOUNTANT = "Accountant";
    public static final String HRM = "hrm";
    public static final String CA = "ca";
    public static final String ACTIVE = "active";
}
