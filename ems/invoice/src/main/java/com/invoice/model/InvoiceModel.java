package com.invoice.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.invoice.request.ProductColumnsRequest;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class InvoiceModel implements Entity{

    @Id
    private String invoiceId;
    private String companyId;
    private String customerId;

    private CompanyEntity company;
    private CustomerModel customer;
    private BankEntity bank;

    private String vendorCode;
    private String purchaseOrder;
    private String invoiceDate;
    private String dueDate;
    private String invoiceNo;
    private String subTotal;
    private String cGst;
    private String sGst;
    private String iGst;
    private String grandTotal;
    private String grandTotalInWords;

    private List<Map<String,  String>> productData;
    private List<ProductColumnsRequest> productColumns;
    private String status;
    private String type;
}