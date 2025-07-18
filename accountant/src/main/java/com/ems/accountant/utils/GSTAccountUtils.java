package com.ems.accountant.utils;

import com.ems.accountant.persistance.CustomerModel;
import com.ems.accountant.persistance.GSTAccountEntity;
import com.ems.accountant.request.GSTAccountRequest;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class GSTAccountUtils {

    public static GSTAccountEntity maskGSTAccountEntity(GSTAccountRequest request, String companyId , String resourceId) {
        GSTAccountEntity entity = new GSTAccountEntity();
        entity.setId(resourceId);
        entity.setCompanyId(companyId);
        entity.setMonth(request.getMonth());
        entity.setYear(request.getYear());
        entity.setInvoiceNumber(request.getInvoiceNumber());
        entity.setCustomerName(request.getCustomerName());
        entity.setCustomerGstNo(base64Encode(request.getCustomerGstNo()));
        entity.setInvoiceDate(base64Encode(request.getInvoiceDate()));
        entity.setTotalAmount(base64Encode(request.getTotalAmount()));
        entity.setSubTotal(base64Encode(request.getSubTotal()));
        entity.setCGst(base64Encode(request.getCGst()));
        entity.setSGst(base64Encode(request.getSGst()));
        entity.setIGst(base64Encode(request.getIGst()));
        entity.setStatus(Constants.FILED);
        entity.setType(Constants.GST_ACCOUNT);

        return entity;
    }

    public static GSTAccountEntity ummaskGSTAccountEntity(GSTAccountEntity entity) {
        if (entity == null) {
            return null;
        }
        GSTAccountEntity maskedEntity = new GSTAccountEntity();
        maskedEntity.setId(entity.getId());
        maskedEntity.setCompanyId(entity.getCompanyId());
        maskedEntity.setYear(entity.getYear());
        maskedEntity.setMonth(entity.getMonth());
        maskedEntity.setCustomerName(entity.getCustomerName());
        maskedEntity.setCustomerGstNo(base64Decode(entity.getCustomerGstNo()));
        maskedEntity.setTotalAmount(base64Decode(entity.getTotalAmount()));
        maskedEntity.setSubTotal(base64Decode(entity.getSubTotal()));
        maskedEntity.setCGst(base64Decode(entity.getCGst()));
        maskedEntity.setSGst(base64Decode(entity.getSGst()));
        maskedEntity.setIGst(base64Decode(entity.getIGst()));

        return maskedEntity;
    }

    private static String base64Decode(String value) {
        return new String(Base64.getDecoder().decode(value), StandardCharsets.UTF_8);
    }

    public static GSTAccountEntity maskUpdatedGSTAccountEntity(GSTAccountEntity entity) {
        GSTAccountEntity maskedEntity = new GSTAccountEntity();
        maskedEntity.setId(entity.getId());
        maskedEntity.setCompanyId(entity.getCompanyId());
        maskedEntity.setCustomerGstNo(base64Encode(entity.getCustomerGstNo()));
        maskedEntity.setTotalAmount(base64Encode(entity.getTotalAmount()));
        maskedEntity.setSubTotal(base64Encode(entity.getSubTotal()));
        maskedEntity.setCGst(base64Encode(entity.getCGst()));
        maskedEntity.setSGst(base64Encode(entity.getSGst()));
        maskedEntity.setIGst(base64Encode(entity.getIGst()));
        maskedEntity.setStatus(Constants.FILED);
        maskedEntity.setType(Constants.GST_ACCOUNT);
        maskedEntity.setYear(entity.getYear());
        maskedEntity.setMonth(entity.getMonth());
        maskedEntity.setInvoiceNumber(entity.getInvoiceNumber());
        maskedEntity.setInvoiceDate(entity.getInvoiceDate());
        maskedEntity.setCustomerName(entity.getCustomerName());

        return maskedEntity;
    }

    private static String base64Encode(String value) {
        return Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }
}