package com.invoice.response;

import lombok.Data;

@Data
public class QuotationResponse {

    private String companyName;
    private String customerName;
    private String customerEmail;
    private String contact;
    private String gstNo;
    private String address;
    private String invoiceDate;
    private String dueDate;
    private String QuotationNumber;
    private String hsnNo;
    private String quantity;
    private String unitCost;
    private String totalCost;
    private String totalAmount;
    private String gst;
    private String shippingDate;
    private String deliveryDate;
    private String shippingAddress;
    private String deliveryAddress;
}
