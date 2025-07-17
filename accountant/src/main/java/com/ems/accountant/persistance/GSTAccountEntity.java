package com.ems.accountant.persistance;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@Builder
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GSTAccountEntity extends AbstractEntity {

    private String companyId;
    private String month;
    private String year;
    private String customerGstNo;
    private String customerName;
    private String invoiceNumber;
    private String invoiceDate;
    private String totalAmount;
    private String subTotal;
    private String cGst;
    private String sGst;
    private String iGst;
    private String status;

}