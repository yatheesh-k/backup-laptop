package com.invoice.util;
import org.springframework.stereotype.Component;

@Component
public class Constants {

    public static final String[] UNITS = {
            "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
            "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    };

    public static final String[] TENS = {
            "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    };
    // Error Messages
    public static final String REMOTE_SERVICE_UNAVAILABLE = "Remote service is not available at the moment";
    public static final String REQUEST_PAYLOAD_INVALID = "Request payload is not valid";
    public static final String REQUEST_UNAUTHORIZED = "Request is unauthorized";
    public static final String REQUEST_RESOURCE_DUPLICATE = "Resource already exists";
    public static final String REQUEST_RESOURCE_NOT_FOUND = "Resource not found";
    public static final String REQUEST_OPERATION_INVALID = "This operation is not allowed";
    public static final String REQUEST_UNABLE_TO_PROCESS = "Remote service is not able to process the request at the moment";
    public static final String AUTH_KEY = "Authorization";
    public static final Object CREATE_SUCCESS = "Created successfully!";
    public static final Object DELETE_SUCCESS = "Deleted successfully";
    public static final Object UPDATE_SUCCESS = "Updated successfully!";
    public static final String ZERO = "0";
    public static final String INVOICE = "invoice";
    public static final String IMAGE_PATH ="/MyImage/**";
    public static final String IMAGE_PATH_FILE ="file:/G:/MyImage/";
    public static final String ZEROS = "Zero";
    public static final String AND = " and ";
    public static final String PAISE = " Paise";
    public static final String ONLY = " Only";
    public static final String HUNDRED = " Hundred";
    public static final String THOUSAND = " Thousand";
    public static final String LAKH = " Lakh";
    public static final String CRORE = " Crore";
    public static final String SERVICE = "service";
    public static final String BEARER = "Bearer";
    public static final String JWT = "JWT";
    public static final String MULTI_PART_FILE = "MultipartFile";
    public static final String STRING = "String";
    public static final String BINARY = "binary";
    public static final String AUTHORIZATION = "Authorization";
    public static final String DEFAULT = "default";
    public static final String CUSTOMER = "customer";
    public static final String INDEX_EMS = "ems";
    public static final String INDEX_INVOICE = "invoice";
    public static final String RESOURCE_ID = "ResourceId";
    public static final String SHORT_NAME = "shortName";
    public static final String DEPARTMENT = "department";
    public static final String DESIGNATION = "designation";
    public static final String NAME = "name";
    public static final String PRODUCT = "product";
    public static final String BANK = "bank_details";
    public static final String TYPE = "type";
    public static final String TEMPLATE = "invoice-template.ftl";
    public static final String ATTACHMENT =  "attachment";
    public static final String INVOICE_ =  "Invoice-";
    public static final String PDF = ".pdf";
    public static final String CUSTOMER_ID= "customerId";
    public static final String COMPANY_ID = "companyId";
    public static final String IGST = "iGst";
    public static final String SGST = "sGst";
    public static final String CGST = "cGst";
}