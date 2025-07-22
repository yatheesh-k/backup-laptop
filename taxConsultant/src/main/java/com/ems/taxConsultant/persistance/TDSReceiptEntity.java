package com.ems.taxConsultant.persistance;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TDSReceiptEntity extends AbstractEntity {

    private String companyId;
    private String month;
    private String year;
    private String tdsTotalAmount;
    private String tdsReceiptNumber;
    private String tdsReceiptDate;
    private String tdsReceiptFileName;
}
