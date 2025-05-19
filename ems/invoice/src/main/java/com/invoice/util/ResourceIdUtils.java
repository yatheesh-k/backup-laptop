package com.invoice.util;

import com.invoice.model.ResourceType;

public class ResourceIdUtils {

    public static String generateProductResourceId(String hsnNo,String productName, String productCategory) {
        return generateGlobalResourceId(ResourceType.PRODUCT, hsnNo,productName, productCategory);
    }

    public static String generateCustomerResourceId(String email, String mobileNumber) {
        return generateGlobalResourceId(ResourceType.CUSTOMER, email,mobileNumber);
    }

    public static String generateInvoiceResourceId(String companyId, String customerId,String timeStamp) {
        return generateGlobalResourceId(ResourceType.INVOICE, companyId, customerId,timeStamp);
    }

    public static String generateCompanyIndex(String name) {
        return Constants.INDEX_EMS+"_"+name;
    }

    public static String generateGlobalResourceId(ResourceType type, Object... args) {
        boolean isCaseSensitive = false;
        String prefix = Constants.DEFAULT + "-";

        if (type == ResourceType.PRODUCT) {
            prefix = Constants.PRODUCT + "-";
        }
      
        if(type == ResourceType.CUSTOMER){
            prefix = Constants.CUSTOMER+"-";
        }
        if (type == ResourceType.INVOICE){
            prefix = Constants.INVOICE + "-";
        }
      
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