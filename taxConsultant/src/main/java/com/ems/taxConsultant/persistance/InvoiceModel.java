package com.ems.taxConsultant.persistance;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import nonapi.io.github.classgraph.json.Id;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class InvoiceModel {

    @Id
    private String invoiceId;
    private String companyId;
    private String customerId;
    private String bankId;

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
    private String notes;
    private String invoiceTemplateNo;

    private String status;
    private String type;

    private String salesPerson;
    private String shippingMethod;
    private String shippingTerms;
    private String paymentTerms;
    private String deliveryDate;
}