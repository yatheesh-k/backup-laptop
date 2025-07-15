package com.ems.accountant.model;

import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.exception.ErrorMessageHandler;
import com.ems.accountant.exception.ErrorMessageKey;
import com.ems.accountant.utils.Constants;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;


@AllArgsConstructor
@Getter
public enum ResourceType {

    COMPANY("company"                                     , Constants.COMPANY),
    EMPLOYEE_ACCOUNT("employee_account", Constants.EMPLOYEE_ACCOUNT),
    PF_RESPONSE("pf_response",            Constants.PF_RESPONSE),
    TDS_RESPONSE("tds_response",            Constants.TDS_RESPONSE),
    PF_RECEIPT("pf_receipt",            Constants.PF_RECEIPT),
    PT_RECEIPT("pt_receipt",            Constants.PT_RECEIPT),

    UNDEFINED(""                                    , "");

    private final String value;
    private final String persistValue;

    public String value() {
        return this.value;
    }
    public String persistValue() {
        return this.persistValue;
    }

    public static ResourceType fromValue(final String value) throws AccountantException {
        ResourceType type = byValue(value);
        if(type != UNDEFINED)
            return type;
        throw new AccountantException(String.format(ErrorMessageHandler.getMessage(ErrorMessageKey.INVALID_RESOURCE_TYPE), value), HttpStatus.BAD_REQUEST);
    }

    //TODO byValue should be replaced with appropriate name
    public static ResourceType byValue(final String value) {
        if(StringUtils.isNotEmpty(value)) {
            for (ResourceType type : values()) {
                if (value.equalsIgnoreCase(type.name())
                        || value.equalsIgnoreCase(type.value())
                        || value.equalsIgnoreCase(type.persistValue())) {
                    return type;
                }
            }
        }
        return UNDEFINED;
    }
}
