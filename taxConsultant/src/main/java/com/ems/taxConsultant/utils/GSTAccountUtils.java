package com.ems.taxConsultant.utils;

import com.ems.taxConsultant.persistance.CustomerModel;
import com.ems.taxConsultant.persistance.GSTAccountEntity;
import com.ems.taxConsultant.persistance.InvoiceModel;
import com.ems.taxConsultant.request.GSTAccountRequest;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.lang.Double.parseDouble;

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
        entity.setInvoiceDate(request.getInvoiceDate());
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
        maskedEntity.setInvoiceNumber(entity.getInvoiceNumber());
        maskedEntity.setInvoiceDate(entity.getInvoiceDate());
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

    public static void unMaskInvoiceProperties(InvoiceModel invoiceEntity) {
        if (invoiceEntity != null) {
            invoiceEntity.setInvoiceNo(invoiceEntity.getInvoiceNo());
            invoiceEntity.setInvoiceDate(base64Decode(invoiceEntity.getInvoiceDate()));
            invoiceEntity.setGrandTotal((invoiceEntity.getGrandTotal()));
            invoiceEntity.setSubTotal(base64Decode(invoiceEntity.getSubTotal()));
            invoiceEntity.setIGst((invoiceEntity.getIGst()));
            invoiceEntity.setCGst((invoiceEntity.getCGst()));
            invoiceEntity.setSGst((invoiceEntity.getSGst()));
        }
    }
    public static void unmaskCustomerProperties(CustomerModel customerModel){

        if(customerModel != null){
            customerModel.setCustomerName(base64Decode(customerModel.getCustomerName()));
            customerModel.setCustomerGstNo(base64Decode(customerModel.getCustomerGstNo()));
        }
    }

    public static void calculateGrandTotal(InvoiceModel invoiceModel) {

        double subTotal = parseDouble(invoiceModel.getSubTotal());
        double cGst = parseDouble(invoiceModel.getCGst());
        double sGst = parseDouble(invoiceModel.getSGst());
        double iGst = parseDouble(invoiceModel.getIGst());

        double grandTotal = subTotal + cGst + sGst + iGst;

        invoiceModel.setGrandTotal(String.valueOf(grandTotal));
    }

    private static double parseDouble(String value) {
        if (value == null || value.trim().isEmpty()) {
            return 0.0;
        }
        return Double.parseDouble(value.trim());
    }
}