package com.ems.accountant.utils;

import com.ems.accountant.model.ResourceType;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

@Component
@Service
@Slf4j
public class ResourceIdUtils {

    /**
     * Generate a global resource ID
     *
     * @param id The ID of the resource
     */
    //todo-to make this static method
    public static String generateCompanyResourceId(String id) {
        return generateGlobalResourceId(ResourceType.COMPANY, id);
    }
    public static String generateCompanyIndex(String name) {
        return Constants.INDEX_EMS+"_"+name;
    }
    public static String generateEmployeeAccountResourceId(String uanNo, String month, String year) {
        return generateGlobalResourceId(ResourceType.EMPLOYEE_ACCOUNT, uanNo, month, year);
    }
    public static String generatePFResponseResourceId(String companyName, String month, String year) {
        return generateGlobalResourceId(ResourceType.PF_RESPONSE, companyName, month, year);
    }
    public static String generatePTResponseResourceId(String companyName, String month, String year) {
        return generateGlobalResourceId(ResourceType.PT_RESPONSE, companyName, month, year);
    }

    public static String generateTDSResponseResourceId(String companyName, String month, String year) {
        return generateGlobalResourceId(ResourceType.TDS_RESPONSE, companyName, month, year);

    }

    public static String generatePFReceiptsResourceId(String companyName, String month, String year) {
        return generateGlobalResourceId(ResourceType.PF_RECEIPT, companyName, month, year);

    }
    public static String generatePTReceiptsResourceId(String companyName, String month, String year) {
        return generateGlobalResourceId(ResourceType.PT_RECEIPT, companyName, month, year);
    }

    public static String generateGSTResponseResourceId(String companyName, String month, String year) {
        return generateGlobalResourceId(ResourceType.GST_RESPONSE, companyName, month, year);
    }

    public static String generateGSTReceiptsResourceId(String companyName, String month, String year) {
        return generateGlobalResourceId(ResourceType.GST_RECEIPT, companyName, month, year);

    }
    public static String generateTDSReceiptResourceId(String companyName, String month, String year) {
        return generateGlobalResourceId(ResourceType.TDS_RECEIPT, companyName, month, year);
    }

    /**
     * Generate a global resource ID based on the resource type
     *
     * @param type The type of resource
     * @param args the values of attributes that uniquely identify the resource. The generator
     *             is sensitive to the order of the specified values
     */
    public static String generateGlobalResourceId(ResourceType type, Object... args) {
        boolean isCaseSensitive = false;
        final String prefix = ((type != null && type != ResourceType.UNDEFINED)
                        ? type.persistValue()
                        : Constants.DEFAULT)
                    + "-";

        StringBuilder md5Input = new StringBuilder();
        for (Object arg : args) {
            if (arg != null) {
                if (md5Input.length() == 0) {
                    md5Input.append(arg.toString());
                } else {
                    md5Input.append(":").append(arg.toString());
                }
            }
        }
        String md5Hash;
        if (isCaseSensitive) {
            md5Hash = org.springframework.util.DigestUtils.md5DigestAsHex(md5Input.toString().getBytes()).toLowerCase();

        } else {
            md5Hash = org.springframework.util.DigestUtils.md5DigestAsHex(md5Input.toString().toLowerCase().getBytes()).toLowerCase();

        }
        return prefix + md5Hash;
    }

}