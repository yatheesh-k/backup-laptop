package com.ems.taxConsultant.utils;



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
    public static final String EMPLOYEE_ID = "employeeId";
    public static final Object DELETED = "Deleted";
    public static final String CUSTOMER_ID = "customerId";
    public static final String GST_ACCOUNT = "gst_account";
    public static final String MISSED_COMPANY_CUSTOMER = "Missed Company Customers";
    public static final String EXTRA_COMPANY_CUSTOMERS = "Extra Customers Not existed in company";
    public static final String GST_MISS_MATCH_CUSTOMERS = "GST Mismatch Customers";
    public static final String CUSTOMER_GST = "customerGstNo";
    public static final String COMPANY_NAME = "companyName";
    public static final String TOTAL_AMOUNT = "totalAmount";
    public static final String SUB_TOTAL = "subTotal";
    public static final String C_GST = "cGst";
    public static final String S_GST = "sGst";
    public static final String I_GST = "iGst";
    public static final String EXCEL = "Excel: ";
    public static final String DB = ", DB: ";
    public static final String INVOICE_NUMBER = "invoiceNumber";
    public static final String CUSTOMER_NAME = "customerName";
    public static final String DIFFERENCES = "Differences";
    public static final String PF_RESPONSE = "pf_response";
    public static final String FILED = "Filed";
    public static final String PT_MISMATCH_EMPLOYEES = "PT Mismatch Employees";
    public static final String PAN_NUMBER = "panNo";
    public static final String PT_MISSING_FOR_PF_EMPLOYEES = "Employees not in the PT sheet who are having PF";
    public static final String PT_EMPLOYEES_WITHOUT_PF = "Employees in PT sheet but not having PF";
    public static final String PT_RESPONSE = "pt_response";
    public static final String TDS_RESPONSE = "tds_response";
    public static final String PF_RECEIPT = "pf_receipt";
    public static final Object SLASH = "/";
    public static final String PATH_PATTERN = "/var/www/ems/assets/img/**";
    public static final String FILE_STORED_PATH = "file:/var/www/ems/assets/img/";
    public static final String PT_RECEIPT = "pt_receipt";
    public static final String GST_RESPONSE = "gst_response";
    public static final String TDS_MISMATCH_EMPLOYEES = "TDS Mismatch Employees";
    public static final String TDS_ALREADY_UPDATED = "TDS Already Updated Employees";
    public static final String PORTAL_CREDENTIALS = "portal_credentials";
    public static final String GST_RECEIPT = "gst_receipt";
    public static final String TDS_RECEIPT= "tds_receipt";
    public static final String TAX_CONSULTANT =  "tax_consultant";
    public static final String HR_MANAGEMENT =  "hr_management";
    public static final String INVOICE_MANAGEMENT =  "invoice_management";


    public static final String DUE_DATES = "due_dates";
    public static final String INVOICE = "invoice";
}
