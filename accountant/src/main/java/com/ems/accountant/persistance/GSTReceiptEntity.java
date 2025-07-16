package com.ems.accountant.persistance;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GSTReceiptEntity extends AbstractEntity {

    private String companyId;
    private String month;
    private String year;
    private String gstTotalAmount;
    private String gstReceiptNumber;
    private String gstReceiptDate;
    private String gstReceiptFileName;

}
